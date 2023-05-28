/**
 * Creates a chat box from a div.chat-box.
 */
class ChatBox {
    constructor(username, room) {
        this.socket = null;
        this.username = username;
        this.room = room;
        this.$div = $(`.chat-box#${room}`);
        this.$chatLog = null;
        this.$entry = null;
        this.maxMessages = 100;

        this.socket = io({
            query: {
                room: this.room,
                name: this.username
            }
        });

        this.socket.on('chat message', this.newMessage);
        this.socket.on('chat info', this.updateInfo);
        this.render();
    }

    /**
     * Renders a new message in the chat.
     * @param {Object} msg An object including the text to render.
     */
    newMessage = (msg) => {
        let time = new Date(msg.time);
        this.$chatLog.append(`<p>[${time.toLocaleTimeString('en-US')}] ${msg.name}: ${msg.text}</p>`);
        this.$chatLog.scrollTop(this.$chatLog.prop("scrollHeight"));
        let msgs = this.$chatLog.find("p");
        if (msgs.length > this.maxMessages) {
            for (let i = 0; i < msgs.length - this.maxMessages; i++) {
                msgs[i].remove();
            }
        }
    }

    /**
     * Updates info about the chat room in the chat box.
     * @param {Object} msg An object including the users in the room.
     */
    updateInfo = (msg) => {
        this.$users.empty();
        for (let i = 0; i < msg.data.users.length; i++) {
            this.$users.append(`<li>${msg.data.users[i]}</li>`);
        }
    }

    /**
     * Sends a new chat message to the server.
     */
    sendMessage = () => {
        if (this.$entry.val() !== ""){
            let val = this.$entry.val();
            this.$entry.val("");

            this.socket.emit('chat message', {
                name: this.username,
                time: Date.now(),
                text: val
            });
        }
    }

    /**
     * Renders necessary child elements.
     */
    render() {
        this.$div.empty();

        this.$header = $(`<h4>Chatting with the name ${this.username}:`).appendTo(this.$div);
        this.$chatLog = $(`<div class="chat-log"></div>`).appendTo(this.$div);
        this.$users = $(`<ul class="users"></ul>`).appendTo(this.$div);
        this.$entry = $(`<input autocomplete="off" type="text" class="chat-entry">`).appendTo(this.$div);
        this.$send = $(`<button class="chat-send">Send</button>`).appendTo(this.$div);

        this.$send.on("click", this.sendMessage);
        this.$entry.on("keyup", (e) => {
            if (e.keyCode == 13) this.sendMessage();
        });
    }
}

