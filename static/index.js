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
        }
