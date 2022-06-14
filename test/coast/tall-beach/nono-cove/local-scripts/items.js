class ItemFloor {
    constructor() {
        this.items = [];
        this.$itemList = $(".floor#items ul.items");
        this.$items = $(".floor#items ul.items li");

        this.$read = $(".floor#items .editor .read");
        this.$readName = $(".floor#items .editor .read #name");
        this.$readShort = $(".floor#items .editor .read #short");
        this.$readFull = $(".floor#items .editor .read #full");

        this.$edit = $(".floor#items .editor .edit");
        this.$editName = $(".floor#items .editor .edit #name");
        this.$editShort = $(".floor#items .editor .edit #short");
        this.$editFull = $(".floor#items .editor .edit #full");

        this.selected = -1;
        this.state = "reading";

        this.updateItems();
    }

    hasValidSelection() {
        return (this.selected > -1 && this.selected < this.items.length);
    }

    async updateItems() {
        try {
            await $.get(`/item/all`, (data) => {
                this.items = data.foundItems;
                this.renderItemList();
            });
        } 
        catch(err) {
            console.log(err);
        }
    };

    renderItemList() {
        this.$itemList.empty();

        for (let i = 0; i < this.items.length; i++) {
            $(".floor#items ul.items").append(`<li onClick="itemFloor.selectItem(${i})">${this.items[i].name}</li>`);
        };

        this.$items = $(".floor#items ul.items li");
        this.selectItem(this.selected);
    }
    
    createNewItem() {
        if (this.state === "reading") {
            this.items.push({
                _id: null,
                name: "New Item",
                shortDescription: "Short Description",
                fullDescription: "Full Description"
            });

            this.renderItemList();
            this.selectItem(this.items.length - 1);
            this.editSelectedItem();
        }
    };

    selectItem(index) {
        this.$items.removeClass("selected");
        this.selected = index;

        if (index > -1) {
            $(this.$items[index]).addClass("selected");
        }

        this.readSelectedItem();
    }

    readSelectedItem() {
        this.cancelEdit();

        if (this.hasValidSelection()) {
            this.$readName.text(this.items[this.selected].name);
            this.$readShort.text(this.items[this.selected].shortDescription);
            this.$readFull.text(this.items[this.selected].fullDescription);
        }
        else {
            this.$readName.text("Please select an item from the list.");
            this.$readShort.text("");
            this.$readFull.text("");
        }
    }

    editSelectedItem() {
        if (this.hasValidSelection()) {
            if (this.state != "editing") {
                this.$read.addClass("invisible");
            }
    
            this.state = "editing";
            this.$edit.removeClass("invisible");
    
            this.$editName.val(this.items[this.selected].name);
            this.$editShort.val(this.items[this.selected].shortDescription);
            this.$editFull.val(this.items[this.selected].fullDescription);
        }
    }

    async saveSelectedItem() {
        if (this.state === "editing") {
            try {
                await $.post("/item", {
                    id: this.items[this.selected]._id,
                    name: this.$editName.val(),
                    shortDescription: this.$editShort.val(),
                    fullDescription: this.$editFull.val(),
                }, () => {
                    this.items[this.selected].name = this.$editName.val();
                    this.items[this.selected].shortDescription = this.$editShort.val();
                    this.items[this.selected].fullDescription = this.$editFull.val();
                    this.cancelEdit();
                    this.updateItems();
                });
            } 
            catch(err) {
                console.log(err);
            }
        }
    }

    cancelEdit() {
        if (this.state === "editing") {
            this.$edit.addClass("invisible");
            this.$read.removeClass("invisible");
            this.state = "reading";
        }
    }

    async deleteSelectedItem() {
        if (this.state === "reading" && this.hasValidSelection()) {
            try {
                await $.post("/item/delete", {
                    id: this.items[this.selected]._id
                }, () => {
                    this.selectItem(-1);
                    this.updateItems();
                });
            } 
            catch(err) {
                console.log(err);
            }
        }
    }
}

let itemFloor = new ItemFloor();






$(".floor button#toggle").on("click", function (e) {
    $(e.target.parentElement).find(".content").toggleClass("invisible");
});