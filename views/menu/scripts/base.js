class Base {
    #Inventory = class Inventory {
        constructor() {
            this.$div = $(".inventory");
            this.$list = $(".inventory .item-list");
            this.$search = $(".inventory .search");
            this.$searchResults = $(".search-results");
            this.searchResults = [];
            this.$error = $("#inventory #error");
            this.items = [];
    
            this.refresh();
        }
    
        async change(itemName, amount) {
            let change = {
                name: itemName,
                amount: amount
            }
    
            let response = await commune("updateItemInInventory", change);
    
            if (response.status === "success") {
                let holding = false;
    
                for (let i = 0; i < this.items.length; i++) {
                    if (this.items[i].name === response.data.name) {
                        this.items[i].amount = response.data.amount;
                        holding = true;
    
                        if (response.data.amount <= 0) this.items.splice(i, 1);
                    }
                }
                
                if (!holding && response.data.amount > 0 && response.data.name) {
                    this.items.push(response.data);
                }
    
                this.render();
    
                return true;
            }
            else return false;
        }
    
        async getData() {
            await $.post("/s", JSON.stringify({ action: "getUserInventory" }), (res) => {
                if (res.status === "success") {
                    this.items = res.data;
    
                    this.clearError();
                }
                else console.log(res);
            });
        }
        
        render() {
            this.$list.empty();
            
            for (let i = 0; i < this.items.length; i++) {
                let $new = this.$list.append(
                    `<div class="item-card">
                        <h5>${this.items[i].name}</h5>
                        <button id="${i}">X</button>
                        <hr>
                        <p>${this.items[i].amount}</p>
                    </div>`
                ).children().last();
    
                $new.find("button").on("click", this.reduceItem);
            }
        }
    
        reduceItem = (e) => {
            let which = parseInt(e.currentTarget.id);
                    
            this.change(this.items[which].name, -1);
    
            this.clearError();
        }
        
        async refresh() {
            await this.getData();
            this.render();
        }
        
        clearError() {
            this.$error.addClass("invisible");
        }
    
        setError(text) {
            this.$error.text(text);
            this.$error.removeClass("invisible");
        }
    
        hasItem(itemName, minAmount = 1) {
            for (let i = 0; i < this.items.length; i++) {
                if (this.items[i].item.name === itemName) {
                    if (this.items[i].amount >= minAmount) return true;
                }
            }
    
            return false;
        }
    }

    #AccountServices = class AccountServices {
        constructor() {
            this.$emailSetting = $(".content#account .setting#email");
            this.$email = this.$emailSetting.find("p");
            this.$emailEdit = $(".content#account .edit#email");
            this.$emailInput = this.$emailEdit.find("input");
    
            this.$usernameSetting = $(".content#account .setting#username");
            this.$username = this.$usernameSetting.find("p");
            this.$usernameEdit = $(".content#account .edit#username");
            this.$usernameInput = this.$usernameEdit.find("input");
    
            this.$passwordSetting = $(".content#account .setting#password");
            this.$passwordEdit = $(".content#account .edit#password");
            this.$passwordInput = this.$passwordEdit.find("input");
    
            this.$info = $(".content#account #info");
            
            // <% if (user) { %>
            //     this.username = "<%= user.username %>";
            //     this.email = "<%= user.email %>";
    
            //     this.refresh();
            // <% } %>
        }
    
        async refresh() {
            this.$email.text(this.email);
            this.$emailInput.val(this.email);
            this.$username.text(this.username);
            this.$usernameInput.val(this.username);
    
            $(".content#account .settings").removeClass("invisible");
            $(".content#account #please-login").addClass("invisible");
        }
    
        editEmail() {
            this.$emailSetting.addClass("invisible");
            this.$emailEdit.removeClass("invisible");
        }
    
        cancelEmail() {
            this.$emailSetting.removeClass("invisible");
            this.$emailEdit.addClass("invisible");
            this.$emailInput.val(this.$email.text());
        }
    
        async updateEmail() {
            let response = await commune("changeUserEmail", { email: this.$emailInput.val() });
    
            this.$email.text(this.$emailInput.val());
            this.cancelEmail();
            this.$info.text("Email Updated!");
    
            location.reload();
        }
    
        editUsername() {
            this.$usernameSetting.addClass("invisible");
            this.$usernameEdit.removeClass("invisible");
        }
    
        cancelUsername() {
            this.$usernameSetting.removeClass("invisible");
            this.$usernameEdit.addClass("invisible");
            this.$usernameInput.val(this.$username.text());
        }
    
        async updateUsername() {
            let response = await commune("changeUsername", { username: this.$usernameInput.val() });
    
            this.$username.text(this.$usernameInput.val());
            this.cancelUsername();
            this.$info.text("Username Updated!");
    
            location.reload();
        }
    }
    
    #playerInventory = new this.#Inventory();
    #accountServices = new this.#AccountServices();
    #$menu = $(".ui .menu");
    #$fade = $(".ui .fade");
    menuClosing = false;
    #$loginEmail = $(".login-cover #email");
    #$loginPassword = $(".login-cover #pass");
    #$loginInfo = $(".login-cover .info");

    constructor() {
       
    }

    #commune = async (action, data = null, options) => {
        try {
            let body = {
                action,
                data,
                ...options
            };
        
            let response = null;
        
            let onResponse = (res) => {
                response = res;
                if (res.status != "success") console.log(`${res.status}: ${res.message}`, res.data);
            };
        
            await $.post("/s", JSON.stringify(body), onResponse);
        
            return response;
        } catch (error) {
            return error;
        }
    }

    closeMenu = function closeMenu() {
        if (!this.menuClosing) {
            this.menuClosing = true;
            this.#$fade.addClass("camo");
            
            setTimeout(() => { 
                this.#$menu.addClass("invisible");
                this.#$fade.addClass("invisible");
                this.menuClosing = false;
            }, 100);
        }
    }

    openMenu = () => {
        this.#$menu.removeClass("invisible");
        this.#$fade.removeClass("camo");
        this.#$fade.removeClass("invisible");
    }

    switchTab = function switchTab(id) {
        $("#content-window .content").addClass("invisible");
        $(".menu .tabs button").removeClass("selected");
        $(`#content-window #${id}`).removeClass("invisible");
        $(`.menu .tabs #${id}`).addClass("selected");
    }
    
    logout = () => {
        $.post("/s", JSON.stringify({
            action: "logout"
        }), () => {location.reload();});
    }
    
    sendMessageToNother = async () => {
        await commune("contactNother", {
            content: $(".menu .content#more #content").val(),
            route: currentRoute
        });
    
        $(".menu .content#more #content").val("");
    }

    attemptLogin = async () => {
        let response = await this.#commune("login", {
            email: $loginEmail.val(),
            password: $loginPassword.val()
        });
        
        if (response.status === "success") {
            $loginInfo.text("You've logged in.");
            location.reload();
        }
        else $loginInfo.text(response.message);
    };

    resetPassword = async () => {
        let response = await this.#commune("sendPasswordReset", {
            email: $loginEmail.val()
        });
        
        if (response.status === "success") {
            $loginInfo.text("A reset code has been sent to your email. Go to the keeper at The Front to finish resetting your password.")
        }
        else $loginInfo.text(response.message);
    }

    do = async (what, data = null) => {
        let response = await this.#commune("serve", {
            script: what
        })
    }
}

let base = new Base();

base.switchTab("inventory");