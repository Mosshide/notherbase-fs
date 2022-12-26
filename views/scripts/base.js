commune = async (route, data = null, options = null) => {
    try {
        let body = { data, ...options };
    
        let response = null;

        await $.post(route, JSON.stringify(body), (res) => {
            response = res;
            if (res.status != "success") console.log(`${res.status}: ${res.message}`, res.data);
        });
    
        return response;
    } catch (error) {
        return error;
    }
}

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
        
        async refresh() {
            let response = await commune("/s/user/getInventory");

            this.items = response.data;

            if (this.items) {
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

                this.clearError();
            }
        }
        
        clearError() {
            this.$error.addClass("invisible");
        }
    
        setError(text) {
            this.$error.text(text);
            this.$error.removeClass("invisible");
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
            
            <% if (user) { %>
                this.username = "<%= user.username %>";
                this.email = "<%= user.email %>";
    
                this.refresh();
            <% } %>
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

    #PlayerAttributes = class PlayerAttributes {
        constructor() {
            this.$content = $(".menu .content#player");
            this.attributes = [];

            <% if (user) { %>
                this.refresh();
            <% } %>
        }

        async refresh() {
            let response = await commune("/s/user/getAttributes");
            this.attributes = response.data;
            console.log(response);

            this.render();
        }

        render() {
            this.$content.empty();

            if (this.attributes) {
                for (const [key, value] of Object.entries(this.attributes)) {
                    this.$content.append(`<h3 id="${key}">${key}: ${value}</h3>`);
                }
            }
        }
    }
    
    #playerInventory = new this.#Inventory();
    #accountServices = new this.#AccountServices();
    #playerAttributes = new this.#PlayerAttributes();
    #$menu = $(".ui .menu");
    #$fade = $(".ui .fade");
    menuClosing = false;

    constructor() {
       
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
    
    logout = async () => {
        let response = await commune("/s/user/logout");

        location.reload();
    }
    
    sendMessageToNother = async () => {
        await commune("contactNother", {
            content: $(".menu .content#more #content").val(),
            route: currentRoute
        });
    
        $(".menu .content#more #content").val("");
    }

    attemptRegister = async (email, username, password) => {
        let response = await commune("/s/user/register", { 
            email, username, password 
        });
        
        return response;
    }

    attemptLogin = async (email, password) => {
        let response = await commune("/s/user/login", {
            email: email,
            password: password
        });
        
        return response;
    };

    resetPassword = async (email) => {
        let response = await commune("/s/user/sendPasswordReset", { email });
        
        return response;
    }

    changePassword = async (token, password, confirmation) => {
        let response = await commune("/s/user/changePassword", { token, password, confirmation });
        
        return response;
    }

    do = async (what, data = null) => {
        let response = await commune("serve", {
            script: what,
            ...data
        });
    }

    load = async (service) => {

    }
}

const base = new Base();

base.switchTab("inventory");