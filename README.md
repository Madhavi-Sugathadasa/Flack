# Flack
Created an **online messaging service** named as **Flack** using **Socket.IO** to communicate between clients and servers.

Technologies: Javascript, python, flask, HTML5, CSS3 and Bootstrap 4.

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


