class ChatBox {
    constructor(name, box, room) {
        this.socket = null;
        import("/socket.io/socket.io.js").then(() => {
            this.socket = io({
                query: {
                    room: room,
                    name: name
                }
            });

            this.socket.on('chat message', this.newMessage);
            $(".chat-send").on("click", this.sendMessage);
            this.$entry.on("keyup", function(e) {
                if (e.keyCode == 13) sendMessage();
            });
        });

        this.room = room;
        this.$div = $(`.chat-box #${box}`)
        this.$chatLog = this.$div.find(".chat-log");
        this.$entry = this.$div.find(".chat-entry");
    }

    newMessage = (msg) => {
        let time = new Date(msg.time);
        this.$chatLog.append(`<p>[${time.toLocaleTimeString('en-US')}] ${msg.name}: ${msg.text}</p>`);
    }

    sendMessage = () => {
        if (this.$entry.val() !== ""){
            let val = this.$entry.val();
            this.$entry.val("");

            // $.post("/chat", {
            //     room: "<%= room %>",
            //     text: val
            // }, function () {
            //     $chatLog.scrollTop($chatLog[0].scrollHeight);
            // });

            this.socket.emit('chat message', {
                name: name,
                time: Date.now(),
                text: val
            });
        }
    }
}

