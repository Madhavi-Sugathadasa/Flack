const DEFAULT_CHANNEL_NAME = '#general';
const DEFAULT_CHANNEL_ID = 0;
const ERROR_INAVLID_USERNAME = '&#10071; Please enter a valid username.';
const ERROR_USERNAME_ALREADY_TAKEN = '&#10071; Your username is already taken. Please try something different.';
const ERROR_CHANNEL_NAME = '&#10071; Please enter a valid channel name';
const ERROR_CHANNEL_NAME_ALREADY_TAKEN = '&#10071; Channel name is already taken. Please try something different.';

document.addEventListener('DOMContentLoaded', () => {

    // if username is not on local storage, popup username creation pannel
    if (localStorage.getItem('username') == null) {

        document.querySelector('#overlay_sign_up').style.display = "block";

    } else {

        document.querySelector('#username_tag').innerHTML = localStorage.getItem('username');
        document.querySelector('#overlay_sign_up').style.display = "none";
    }



    // Connect to websocket for messages communication
    var socket_messages = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    // Connect to websocket for channels communciation
    var socket_channels = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    // Connect to websocket for like count (thumbs up) communciation
    var socket_thumbs = io.connect(location.protocol + '//' + document.domain + ':' + location.port);



    // When connected to message communication socket, configure message pannel
    socket_messages.on('connect', () => {

        document.querySelector('#message').onkeyup = function (event) {

            var code = event.keyCode ? event.keyCode : event.which;
            if (code === 13 && !event.shiftKey) {

                const message = this.value;
                const channel = localStorage.getItem('channel');
                const user = localStorage.getItem('username');
                socket_messages.emit('send message', {
                    'message': message,
                    'channel': channel,
                    'user': user
                });
                this.value = "";
                return false;

            }

        };

    });


    // When connected to channels communication socket, configure channel creation form
    socket_channels.on('connect', () => {

        document.querySelector('#form_create_channel').onsubmit = event => {
            event.preventDefault();
            const channel = (document.querySelector('#channel_name').value).trim();
            if (channel.length === 0) {
                document.querySelector('#error_channel_creation').style.display = "block";
                document.querySelector('#error_channel_creation').innerHTML = ERROR_CHANNEL_NAME;

            } else {
                // Initialize new request to check whether the channel name is already existing 
                const request = new XMLHttpRequest();
                request.open('POST', '/check_channel');

                // Callback function for when request completes
                request.onload = () => {

                    // Extract JSON data from request
                    const data = JSON.parse(request.responseText);

                    //if channel name avalible emit channel creation
                    if (data.success) {

                        socket_channels.emit('create channel', {
                            'channel': channel
                        });
                        document.querySelector('#channel_name').value = "";
                        document.querySelector('#error_channel_creation').innerHTML = "";
                        document.querySelector('#error_channel_creation').style.display = "none";
                        document.querySelector('#overlay_channel_creation').style.display = "none";
                        return false;


                    } else {
                        document.querySelector('#error_channel_creation').style.display = "block";
                        document.querySelector('#error_channel_creation').innerHTML =ERROR_CHANNEL_NAME_ALREADY_TAKEN;
                    }
                }

                // Add data to send with request
                const data = new FormData();
                data.append('channel', channel);

                // Send request
                request.send(data);
                return false;
            }

        }
    });

    // When connected to likes (thumps up) communication socket, configure thumbs up emoji icons
    socket_thumbs.on('connect', () => {


        document.querySelectorAll('.emoji_thumbs_up').forEach(function (span) {
            {
                span.onclick = function () {

                    const message_id = span.dataset.messageid;
                    const user = localStorage.getItem('username');
                    socket_thumbs.emit('update thumbs', {
                        'message_id': message_id,
                        'username': user
                    });
                    return false;
                };
            }
        });

    });

    //load messages for selected channel
    if (localStorage.getItem('channel') != null && localStorage.getItem('channel_id') != null) {

        //selecting the channel
        document.querySelector('#channel_' + (localStorage.getItem('channel_id'))).className = "selected_channel";
        document.querySelector('#channel_selected_name').innerHTML = localStorage.getItem('channel');
        document.querySelector('#message').placeholder = "Message " + localStorage.getItem('channel');
        document.querySelector('.selected_channel').onclick = function () {

            if (this.dataset.joined != null && this.dataset.joined == "false") {
                update_just_joined(this, socket_messages);
            }

            load_messages(this, socket_thumbs);
        };

        remove_message_elements();
        add_messages(socket_thumbs);
    }


    //configure each channel onclick function
    document.querySelectorAll('.channel').forEach(function (div) {
        div.onclick = function () {

            if (div.dataset.joined != null && div.dataset.joined == "false") {
                update_just_joined(div, socket_messages);
            }
            load_messages(div, socket_thumbs);
        };
    });


    //configure username form onsubmit
    document.querySelector('#form_sign_up').onsubmit = event => {
        event.preventDefault();
        const username = (document.querySelector('#username').value).trim();
        if (username.length == 0) {
            document.querySelector('#error_sign_up').style.display = "block";
            document.querySelector('#error_sign_up').innerHTML = ERROR_INAVLID_USERNAME;
        } else {
            // Initialize new request for check whether username is already existing
            const request = new XMLHttpRequest();
            request.open('POST', '/check_username');

            // Callback function for when request completes
            request.onload = () => {
                // Extract JSON data from request
                const data = JSON.parse(request.responseText);

                // Update the result div
                if (data.success) {
                    localStorage.setItem('username', username);

                    // if channel is not on local storage, setup #general channel as default & join the default channel
                    if (localStorage.getItem('channel') == null) {

                        document.querySelector('#channel_0').className = "selected_channel";
                        localStorage.setItem('channel', DEFAULT_CHANNEL_NAME);
                        localStorage.setItem('channel_id', DEFAULT_CHANNEL_ID);
                        document.querySelector('#channel_selected_name').innerHTML = DEFAULT_CHANNEL_NAME;
                        document.querySelector('#message').placeholder = "Message " + DEFAULT_CHANNEL_NAME;

                        //update just joined
                        update_just_joined(document.querySelector('.selected_channel'), socket_messages);
                        document.querySelector('.selected_channel').onclick = function () {
                            if (this.dataset.joined != null && this.dataset.joined == "false") {
                                update_just_joined(this, socket_messages);
                            }

                            load_messages(this, socket_thumbs);
                        };

                        remove_message_elements();
                        add_messages(socket_thumbs);

                    }

                    document.querySelector('#username_tag').innerHTML = username;
                    document.querySelector('#error_sign_up').style.display = "none";
                    document.querySelector('#overlay_sign_up').style.display = "none";


                } else {
                    document.querySelector('#error_sign_up').style.display = "block";
                    document.querySelector('#error_sign_up').innerHTML = ERROR_USERNAME_ALREADY_TAKEN;
                }
            }

            // Add data to send with request
            const data = new FormData();
            data.append('username', username);

            // Send request
            request.send(data);
            return false;
        }

    }

    //configure channel addition button
    document.querySelector('#add_channel').onclick = () => {


        document.querySelector('#overlay_channel_creation').style.display = "block";

    }

    //configure channel creation cancel
    document.querySelector('#cancel_create').onclick = () => {
        document.querySelector('#error_channel_creation').innerHTML = "";
        document.querySelector('#error_channel_creation').style.display = "none";
        document.querySelector('#overlay_channel_creation').style.display = "none";
    }


    // When a new message is sent, add to the message view only if users channel and message channel equals
    socket_messages.on('message sent', data => {
        if (data[1] == localStorage.getItem('channel')) {
            add_message(data[0], socket_thumbs);
            updateScroll();
        }

    });


    // When a new channel is created, add to the channel list
    socket_channels.on('channel added', data => {

        const channel = document.createElement('div');
        channel.innerHTML = data[0];
        channel.setAttribute("id", "channel_" + data[1]);
        channel.setAttribute("data-channel", data[1]);
        channel.setAttribute("data-joined", "false");
        channel.setAttribute("class", "channel");

        channel.onclick = function () {
            update_just_joined(channel, socket_messages);
            load_messages(channel, socket_thumbs);
        };

        document.querySelector('#channels').append(channel);

    });


    // When a new like is recived, update the like count on the relevant message
    socket_thumbs.on('thumbs updated', data => {

        message_id = data[0];
        thumbs_count = data[1];
        if (document.querySelector('#msg_id_' + message_id) != null) {
            if (thumbs_count > 0) {

                const thumbs_count_span = document.querySelector('#msg_id_' + message_id);
                thumbs_count_span.innerHTML = "&#128077;" + thumbs_count;
                thumbs_count_span.className = "tooltip";
                const thumbs_up_users = document.createElement('span');
                thumbs_up_users.className = "tooltiptext";
                const thumbs_up_user_arr = data[2];
                const thumbs_up_user_arr_len = thumbs_up_user_arr.length;
                for (let i = 0; i < thumbs_up_user_arr_len; i++) {
                    thumbs_up_users.innerHTML += thumbs_up_user_arr[i];
                    if (i != thumbs_up_user_arr_len - 1) {
                        const break_element = document.createElement('br');
                        thumbs_up_users.append(break_element);
                    }
                }
                //thumbs_up_users.innerHTML = data[2];
                thumbs_count_span.append(thumbs_up_users);

            } else {
                document.querySelector('#msg_id_' + message_id).innerHTML = "";
            }
        }


    });
});


// Add new messages
function add_messages(socket_thumbs) {

    // Initialize new request for get messages for a selected channel
    const request = new XMLHttpRequest();
    request.open('POST', '/get_messages');

    // Callback function for when request completes
    request.onload = () => {
        // Extract JSON data from request
        const data = JSON.parse(request.responseText);
        //append messages to the parent
        const data_len = data.length;
        for (var i = 0; i < data_len ; i++) {
            add_message(data[i], socket_thumbs);
        }
        //scroll down
        updateScroll();
    }

    // Add data to send with request
    const data = new FormData();
    data.append('channel', localStorage.getItem('channel'));

    // Send request
    request.send(data);
}

// if user just joined the group, send an message to the channel
function update_just_joined(element, socket_messages) {

    // Initialize new request for get users for this channel
    const request = new XMLHttpRequest();
    request.open('POST', '/update_just_joined');

    // Callback function for when request completes
    request.onload = () => {
        // Extract JSON data from request
        const data = JSON.parse(request.responseText);

        //if user just joined data will return success and emit a message to the channel
        if (data.success) {
            socket_messages.emit('send message', {
                'message': ("joined " + element.innerHTML),
                'channel': element.innerHTML,
                'user': localStorage.getItem('username')
            });

            //update dataset joined, this will use to not send an request if user already joined
            element.setAttribute("data-joined", "true");
        }
    }

    // Add data to send with request
    const data = new FormData();
    data.append('channel', element.innerHTML);
    data.append('username', localStorage.getItem('username'));

    // Send request
    request.send(data);
}

// Add a new message
function add_message(data, socket_thumbs) {
    const message = document.createElement('div');
    message.className = "messageContainer";

    if (data[1] == localStorage.getItem('username')) {
        message.className = "messageContainer myMessages";
    }

    const strong_name = document.createElement('strong');
    const br_ele = document.createElement('br');
    const time = document.createElement('span');
    strong_name.innerHTML = data[1] + " ";
    message.append(strong_name);
    time.innerHTML = data[2];
    time.className = "time";
    message.append(time);
    message.append(br_ele);
    message.innerHTML += data[3] + " ";
    const like_count = document.createElement('span');
    like_count.setAttribute("id", "msg_id_" + data[0]);
    like_count.setAttribute("data-messageid", data[0]);

    like_count.onclick = function () {
        socket_thumbs.emit('update thumbs', {
            'message_id': this.dataset.messageid,
            'username': localStorage.getItem('username')
        });
        return false;
    };

    if (data[4] > 0) {
        like_count.innerHTML = "&#128077;" + data[4];


        like_count.className = "tooltip";
        const thumbs_up_users = document.createElement('span');
        thumbs_up_users.className = "tooltiptext";
        const thumbs_up_user_arr = data[5];
        for (let i = 0; i < thumbs_up_user_arr.length; i++) {
            thumbs_up_users.innerHTML += thumbs_up_user_arr[i];
            if (i != thumbs_up_user_arr.length - 1) {
                const break_element = document.createElement('br');
                thumbs_up_users.append(break_element);
            }
        }
        //thumbs_up_users.innerHTML = data[5];
        like_count.append(thumbs_up_users);


    } else {
        like_count.innerHTML = "";
    }

    message.append(like_count);

    const emoji = document.createElement('div');
    const emoji_icon = document.createElement('span');
    username = localStorage.getItem('username');
    emoji_icon.className = "emoji_thumbs_up";
    emoji_icon.setAttribute("data-messageid", data[0]);

    emoji_icon.onclick = function () {
        socket_thumbs.emit('update thumbs', {
            'message_id': this.dataset.messageid,
            'username': localStorage.getItem('username')
        });
        return false;
    };
    emoji_icon.innerHTML = "&#128077;";
    emoji.append(emoji_icon);
    emoji.className = "messageOverlay";
    message.append(emoji);
    // Add message to DOM.
    document.querySelector('#messages').append(message);
}

//load messages related to a channel
function load_messages(element, socket_thumbs) {

    //unselect already selected channel
    if (localStorage.getItem('channel') != null && localStorage.getItem('channel_id') != null) {

        document.querySelector('#channel_' + (localStorage.getItem('channel_id'))).className = "channel";
    }
    //update new selected channel
    element.className = "selected_channel";
    localStorage.setItem('channel', element.innerHTML);
    localStorage.setItem('channel_id', element.dataset.channel);
    document.querySelector('#channel_selected_name').innerHTML = element.innerHTML;
    document.querySelector('#message').placeholder = "Message " + element.innerHTML;

    remove_message_elements();
    add_messages(socket_thumbs);

}

//scroll down on the pannel
function updateScroll() {
    var element = document.getElementById("messages");
    element.scrollTop = element.scrollHeight;
}

//remove all messages from pannel
function remove_message_elements() {

    list = document.querySelector('#messages');
    //remove all elements
    while (list.hasChildNodes()) {
        list.removeChild(list.firstChild);
    }
}
