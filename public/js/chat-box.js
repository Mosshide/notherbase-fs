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
        this.render();
    }

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

    render() {
        this.$div.empty();

        this.$div.append(`<h4>Chatting with the name ${this.username}:`);
        this.$div.append(`<div class="chat-log"> </div>`);
        this.$div.append(`<input autocomplete="off" type="text" class="chat-entry">`);
        this.$div.append(`<button class="chat-send">Send</button>`);

        this.$chatLog = this.$div.find(".chat-log");
        this.$entry = this.$div.find(".chat-entry");

        this.$div.find("button").on("click", this.sendMessage);
        this.$entry.on("keyup", (e) => {
            if (e.keyCode == 13) this.sendMessage();
        });
    }
}

