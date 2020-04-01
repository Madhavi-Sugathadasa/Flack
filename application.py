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