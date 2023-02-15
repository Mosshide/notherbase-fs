class Base {
    static commune = async (route, data = null, options = null) => {
        let body = { data, ...options };
    
        let response = null;

        await $.post(route, JSON.stringify(body), (res) => {
            response = res;
            if (res.status != "success") console.log(`${route} - ${res.message}`);
        });
    
        return response;
    }

    #Inventory = class Inventory {
        constructor() {
            this.items = [];
            this.lastUpdate = 0;
    
            <% if (user) { %>
                this.refresh();
            <% } %>
        }
        
        async refresh() {
            let $list = $(".inventory .item-list");

            let response = await Base.commune("/s/user/getInventory", {}, { _lastUpdate: this.lastUpdate });

            if (response.status === "success") {
                this.items = response.data;
                this.lastUpdate = response.lastUpdate;
                $list.empty();
                
                for (let i = 0; i < this.items.length; i++) {
                    let $new = $list.append(
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
            let $error = $("#inventory #error");

            $error.addClass("invisible");
        }
    
        setError(text) {
            let $error = $("#inventory #error");

            $error.text(text);
            $error.removeClass("invisible");
        }
    }

    #PlayerAttributes = class PlayerAttributes {
        constructor() {
            this.attributes = [];
            this.lastUpdate = 0;

            <% if (user) { %>
                this.refresh();
            <% } %>
        }

        async refresh() {
            let response = await Base.commune("/s/user/getAttributes", {}, { _lastUpdate: this.lastUpdate });
            if (response.status === "success") {
                this.lastUpdate = response.lastUpdate;
                this.attributes = response.data;
    
                this.render();
            }
        }

        render() {
            let $content = $(".menu .content#player");

            $content.empty();

            if (this.attributes) {
                for (const [key, value] of Object.entries(this.attributes)) {
                    $content.append(`<h3 id="${key}">${key}: ${value}</h3>`);
                }
            }
        }
    }

    #AccountServices = class AccountServices {
        constructor() {
            this.username = "";
            this.email = "";
            
            <% if (user) { %>
                this.username = "<%= user.username %>";
                this.email = "<%= user.email %>";
    
                this.refresh();
            <% } %>
        }
    
        refresh() {
            let $email = $(".content#account .setting#email p");
            let $emailInput = $(".content#account .edit#email input");
            let $username = $(".content#account .setting#username p");
            let $usernameInput = $(".content#account .edit#username input");
            
            $email.text(this.email);
            $emailInput.val(this.email);
            $username.text(this.username);
            $usernameInput.val(this.username);
    
            $(".content#account .settings").removeClass("invisible");
            $(".content#account #please-login").addClass("invisible");
        }
    
        editEmail() {
            let $emailSetting = $(".content#account .setting#email");
            let $emailEdit = $(".content#account .edit#email");

            $emailSetting.addClass("invisible");
            $emailEdit.removeClass("invisible");
        }
    
        cancelEmail() {
            let $email = $(".content#account .setting#email p");
            let $emailSetting = $(".content#account .setting#email");
            let $emailEdit = $(".content#account .edit#email");
            let $emailInput = $(".content#account .edit#email input");

            $emailSetting.removeClass("invisible");
            $emailEdit.addClass("invisible");
            $emailInput.val($email.text());
        }
    
        async updateEmail() {
            let $info = $(".content#account #info");
            let $email = $(".content#account .setting#email p");
            let $emailInput = $(".content#account .edit#email input");

            let response = await Base.commune("/s/user/changeEmail", { email: $emailInput.val() });
    
            if (response.status === "success") {
                $email.text($emailInput.val());
                $info.text("Email Updated.");
            }
            else {
                $info.text("Email Not Updated!");
            }
            this.cancelEmail();
        }
    
        editUsername() {
            let $usernameSetting = $(".content#account .setting#username");
            let $usernameEdit = $(".content#account .edit#username");

            $usernameSetting.addClass("invisible");
            $usernameEdit.removeClass("invisible");
        }
    
        cancelUsername() {
            let $usernameSetting = $(".content#account .setting#username");
            let $usernameEdit = $(".content#account .edit#username");
            let $usernameInput = $(".content#account .edit#username input");
            let $username = $(".content#account .setting#username p");

            $usernameSetting.removeClass("invisible");
            $usernameEdit.addClass("invisible");
            $usernameInput.val($username.text());
        }
    
        async updateUsername() {
            let $info = $(".content#account #info");
            let $username = $(".content#account .setting#username p");
            let $usernameInput = $(".content#account .edit#username input");

            let response = await Base.commune("/s/user/changeUsername", { username: $usernameInput.val() });
    
            if (response.status === "success") {
                $username.text($usernameInput.val());
                $info.text("Username Updated.");
            }
            else {
                $info.text("Username Not Updated!");
            }
            this.cancelUsername();
        }
    }
    
    constructor() {
        this.playerInventory = new this.#Inventory();
        this.playerAttributes = new this.#PlayerAttributes();
        this.playerAccount = new this.#AccountServices();
        this.menuClosing = false;
    }

    closeMenu = () => {
        let $menu = $(".ui .menu");
        let $fade = $(".ui .fade");

        if (!this.menuClosing) {
            this.menuClosing = true;
            $fade.addClass("camo");
            
            setTimeout(() => { 
                $menu.addClass("invisible");
                $fade.addClass("invisible");
                this.menuClosing = false;
            }, 100);
        }
    }

    openMenu = () => {
        let $menu = $(".ui .menu");
        let $fade = $(".ui .fade");

        $menu.removeClass("invisible");
        $fade.removeClass("camo");
        $fade.removeClass("invisible");
    }

    switchTab = function switchTab(id) {
        $("#content-window .content").addClass("invisible");
        $(".menu .tabs button").removeClass("selected");
        $(`#content-window #${id}`).removeClass("invisible");
        $(`.menu .tabs #${id}`).addClass("selected");
    }
    
    logout = async () => {
        let response = await Base.commune("/s/user/logout");

        return response;
    }
    
    sendMessageToNother = async () => {
        await Base.commune("contactNother", {
            content: $(".menu .content#more #content").val(),
            route: currentRoute
        });
    
        $(".menu .content#more #content").val("");
    }

    attemptRegister = async (email, username, password) => {
        let response = await Base.commune("/s/user/register", { 
            email, username, password 
        });
        
        return response;
    }

    attemptLogin = async (email, password) => {
        let response = await Base.commune("/s/user/login", {
            email: email,
            password: password
        });

        if (response.status === "success") {
            this.playerInventory.refresh();
            this.playerAccount.username = response.data;
            this.playerAccount.email = email;
            this.playerAccount.refresh();
            this.playerAttributes.refresh();
        }
        
        return response;
    };

    resetPassword = async (email, test = false) => {
        let response = await Base.commune("/s/user/sendPasswordReset", { email, test });
        
        return response;
    }

    changePassword = async (token, email, password, confirmation) => {
        let response = await Base.commune("/s/user/changePassword", { token, email, password, confirmation });
        
        return response;
    }

    do = async (what, data = null, route = window.location.pathname) => {
        let response = Base.commune("/s/serve", {
            script: what,
            ...data
        }, {
            route
        });

        this.playerInventory.refresh();
        this.playerAttributes.refresh();

        await response;
        return response;
    }

    load = async (service, scope = "local") => {
        let response = await $.get("/s/load", { service, scope, route: window.location.pathname });

        return response;
    }
}

const base = new Base();

base.switchTab("inventory");