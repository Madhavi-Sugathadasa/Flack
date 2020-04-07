import os
import requests
import datetime
import copy


from flask import Flask, jsonify, render_template, request
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

NO_OF_RESULTS_PER_CHANNEL = 100
message_id = 0
# list of users, eg: users = ['user1','user2', ....]
users = []
# list of channels, default channel #general, eg: channels = ['#general','channel 1','channel 2',...]
channels = ['#general']
# dict of messages per each channel,default channel #general, eg: messages = {'channel1':[[msg_id,user1,timestamp,message1],[msg_id,user1,timestamp,message2]], ...}
messages = {'#general': []}
# list of users who added a thumps up for each message, eg: thumbs = {'msg_1':[user1,user2],'msg_2':[user2,user3],...}
thumbs = {}
# list of users who joined each channel, joined_users = {'channel 1':[user1, user2], 'channel 2':[user1,user3]}
joined_users = {'#general': []}


@app.route("/")
def index():
    return render_template("index.html", channels=channels)

# check username is already existing, if it is available add to the users list
@app.route("/check_username", methods=["POST"])
def check_username():
    username = request.form.get("username")
    username = username.strip()
    # check username is already existing
    if username in users:
        return jsonify({"success": False})

    users.append(username)
    return jsonify({"success": True})

# check channel is already existing, if it is available add to the channels list
@app.route("/check_channel", methods=["POST"])
def check_channel_name():
    channel = request.form.get("channel")
    # check channel name is already existing
    if channel in channels:
        return jsonify({"success": False})

    # add channel to the list
    channels.append(channel)

    # add empty message list to the messages dict
    messages[channel] = []

    # add empty list to joined users dict
    joined_users[channel] = []

    return jsonify({"success": True})

# get all messages relevant to a selected channel
@app.route("/get_messages", methods=["POST"])
def get_messages():
    channel = request.form.get("channel")
    messages_selected = messages[channel]
    # make a deep copy of all massages of a selected channel
    messages_selected_copy = copy.deepcopy(messages_selected)

    for index, message in enumerate(messages_selected_copy):
        # calculate likes count & list of users who gave like(thumbs up) and append it to the copy
        like_count = 0
        thumbs_up_users = []
        message_str = "msg_" + str(message[0])
        if thumbs.get(message_str) is not None:
            thumbs_up_users = thumbs.get(message_str)
            like_count = len(thumbs_up_users)

        messages_selected_copy[index].append(like_count)
        messages_selected_copy[index].append(thumbs_up_users)
    return jsonify(messages_selected_copy)


# check whether user just joined the channel, if yes add user to joined_users dict
@app.route("/update_just_joined", methods=["POST"])
def update_just_joined():
    channel = request.form.get("channel")
    username = request.form.get("username")
    joined_users_list = joined_users[channel]

    # check user is already joined
    if username in joined_users_list:
        return jsonify({"success": False})

    # add user to the list of joined channels
    joined_users_list.append(username)
    return jsonify({"success": True})


# get list of users who liked a message
@app.route("/get_thumbs_up_users", methods=["POST"])
def get_thumbs_up_users():
    message_id_val = request.form.get("message_id")
    msg_string = "msg_" + str(message_id_val)
    thumbs_up_users = []
    if thumbs.get(msg_string) is not None:
        thumbs_up_users = thumbs.get(msg_string)

    return jsonify(thumbs_up_users)

# socket listener for messaging, add message to the messages dict & emit the message to other users
@socketio.on("send message")
def send_message(data):
    message = data["message"]
    channel = data["channel"]
    user = data["user"]
    # create a new datetime object to create a timestamp for a message
    dateTimeObj = datetime.datetime.now()
    timestamp = dateTimeObj.strftime("%Y") + '/' + dateTimeObj.strftime("%m") + '/' + dateTimeObj.strftime("%d") + "@" + dateTimeObj.strftime("%I") + ':'+dateTimeObj.strftime("%M") + dateTimeObj.strftime("%p")
    global message_id
    if messages.get(channel) is not None:
        messages[channel].append([message_id, user, timestamp, message])
        # check appending this message excced the NO of results per channel, then pop first element out
        if len(messages[channel]) > NO_OF_RESULTS_PER_CHANNEL:
            messages[channel].pop(0)
    else:
        messages.update(channel=[message_id, user, timestamp, message])

    message_id += 1
    like_count = 0
    thumbs_up_users = []

    msg_str = "msg_" + str(message_id-1)
    if thumbs.get(msg_str) is not None:
        like_count = len(thumbs.get(msg_str))
        thumbs_up_users = thumbs.get(msg_str)
    message_copy = [message_id-1, user, timestamp, message, like_count, thumbs_up_users]
    emit("message sent", [message_copy, channel], broadcast=True)

# socket listener for channel addition and brodcast new channel to other users
@socketio.on("create channel")
def create_channel(data):
    channel = data["channel"]
    channel_index = channels.index(channel)
    emit("channel added", [channel, channel_index], broadcast=True)


# socket listener to update likes (thumbs up count), and broadcast updated like count to other users
@socketio.on("update thumbs")
def update_thumbs_count(data):
    message_id_val = data["message_id"]
    username = data["username"]
    msg_string = "msg_" + str(message_id_val)
    thumbs_count = 0
    thumbs_users = thumbs.get(msg_string)
    if thumbs_users is not None:
        if username in thumbs_users:
            index = thumbs_users.index(username)
            thumbs_users.pop(index)
        else:
            thumbs_users.append(username)
    else:
        thumbs[msg_string] = [username]
    thumbs_users = thumbs.get(msg_string)
    thumbs_count = len(thumbs_users)
    emit("thumbs updated", [message_id_val, thumbs_count, thumbs_users], broadcast=True)