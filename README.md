# Flack
Created an **online messaging service** named as **Flack** using **Socket.IO** to communicate between clients and servers.

Technologies: Javascript, python, flask, HTML5, CSS3 and Bootstrap 4.

View Screencast on https://www.youtube.com/watch?v=203qFafnLxU

---
### Features

1. **Display Name**: When a user visits the web application for the first time, they will be prompted to type in a display name that will eventually be associated with every message the user sends. If a user closes the page and returns to the app later, the display name will still be remembered.

2. **Channel Creation**: Any user will be able to create a new channel, so long as its name doesn’t conflict with the name of an existing channel.

3. **Channel List**: Users will be able to see a list of all current channels, and selecting one will allow the user to view the channel.

4. **Messages View**: Once a channel is selected, the user will see any messages that have already been sent in that channel, up to a maximum of 100 messages. The app will only store the 100 most recent messages per channel in server-side memory.

5. **Sending Messages**: Once in a channel, users will be able to send text messages to others the channel. When a user sends a message, their display name and the timestamp of the message will be associated with the message. All users in the channel will then see the new message (with display name and timestamp) appear on their channel page. Sending and receiving messages will NOT require reloading the page.

6. **Remembering the Channel**: If a user is on a channel page, closes the web browser window, and goes back to the web application, the application will remember what channel the user was on previously and take the user back to that channel.


Apart from the features mentioned above, I decided to add a default channel titled “#general” and once users signup with their user names, that channel will be automatically selected & user will be automatically diverted to the channel. If user creates a new channel, then all other users will be able to see that channel & by clicking on the channel, they will also join the channel. An automatic message will be sent on the channel when the channel is clicked for the first time.

For the **personal touch**, next to each message, there will be a **like icon** (thumbs up icon) where users can acknowledge or approve a message by clicking on it. Also if they already have put a like, they can unlike it by clicking on it again.

Let me explain each file in details.

---

**application.py** -  7 global variables are used including a constant. 

1. global variable  **_message_id_**  - each message has a id , this is a incrementing value by one
2. global variable **_users_** - list of all users 
3. global variable **_channels_** - list of all channels
4. global variable **_messages_** - a dictionary - each key is channel name and then value is a list  of all messages sent on that channel. 
5. global variable **_thumbs_** - a dictionary - each key is a message message ( repeated?) id and value is a list of all users who liked that message
6. global variable **_joined_users_** - a dictionary - key is the channel name and value is a list of all users who joined that channel
7. Constant **_NO_OF_RESULTS_PER_CHANNEL_** - this is set to 100



**6 routes and 3 sockets** were used.

Small description about each route
1. route(“/") - for displaying the index page
2. route("/check_username", methods=[“POST"]) - check username is already existing, if not add to the **_users_** list
3. route("/check_channel", methods=[“POST"]) - check channel name is already existing, if not add to the **_channels_** list
4. route("/get_messages", methods=[“POST"]) - get all messages relevant to a selected channel
5. route("/update_just_joined", methods=[“POST"]) - check whether user just joined the channel, if yes add to the **_joined_users_** dictionary
6. route("/get_thumbs_up_users", methods=[“POST"]) - get list of users who liked a message


Small description about each socket
1. Socket on("send message”) - listener for messaging, add message to the messages dictionary & broadest the message to other users
2. Socket  on("create channel”) - listener for channel addition and broadcast any new channel to other users
3. Socket on("update thumbs”) - listener to update likes (thumbs up count), and broadcast updated like count and list of users who liked to other users

---

**index.html** - this is a single html page app. There are two forms, one for user sign up & another for channel addition 

---

**styles.css** - Instead of using Bootstrap for styling and I have written all css by myself. I wanted to create a modern looking online application.

---

**index.js** - there are **3 sockets** 
1. Socket socket_messages - control messaging without refreshing the page
2. Socket socket_channels - controlling channel addition without refreshing the page 
3. Socket socket_thumbs - controlling like count & liked users without refreshing the page


**3 local storage objects** were used to save **_username_** and **_selected channel_** and **_its id_**

**4 Ajax calls** were used
1. to check whether username is already existing 
2. to check whether channel name is already existing 
3. to get all messages for a selected channel once clicked on the channel
4. To check whether a user has just joined the channel

---

**logo.png**  - I created this logo 

---


