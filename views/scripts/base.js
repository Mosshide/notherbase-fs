class Base {
    static commune = async (route, data = {}) => {
        let response = await $.post("/s/user/" + route, JSON.stringify(data));

        if (response.status != "success") console.log(`${"/s/user/" + route} - ${response.message}`);
    
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

            let response = await Base.commune("getInventory", { _lastUpdate: this.lastUpdate });

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
            let response = await Base.commune("getAttributes", { _lastUpdate: this.lastUpdate });
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

            let response = await Base.commune("changeEmail", { email: $emailInput.val() });
    
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

            let response = await Base.commune("changeUsername", { username: $usernameInput.val() });
    
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
        let response = await Base.commune("logout");

        return response;
    }

    attemptRegister = async (email, username, password) => {
        let response = await Base.commune("register", { 
            email, username, password 
        });
        
        return response;
    }

    attemptLogin = async (email, password) => {
        let response = await Base.commune("login", {
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
        let response = await Base.commune("sendPasswordReset", { email, test });
        
        return response;
    }

    changePassword = async (token, email, password, confirmation) => {
        let response = await Base.commune("changePassword", { token, email, password, confirmation });
        
        return response;
    }

    do = async (what, data = null) => {
        let response = await $.post("/s/serve", JSON.stringify({ 
            script: what,
            route: window.location.pathname,
            ...data
        }));

        if (response.status != "success") console.log(`${window.location.pathname} - ${response.message}`);

        this.playerInventory.refresh();
        this.playerAttributes.refresh();
        
        return response;
    }

    load = async (service, scope = "local") => {
        let response = await $.post("/s/load", JSON.stringify({ service, scope }));

        return response;
    }
}

const base = new Base();

base.switchTab("inventory");