class Base {
    /**
     * Communes with the user spirit for easy access to those functions.
     * @param {String} route /s/user/[route]
     * @param {Object} data Data to send with the communion.
     * @returns Communion response.
     */
    static commune = async (route, data = {}) => {
        let response = await $.post("/s/user/" + route, JSON.stringify(data));

        if (response.status != "success") console.log(`${"/s/user/" + route} - ${response.message}`);
    
        return response;
    }

    /**
     * The player's inventory.
     */
    #Inventory = class Inventory {
        constructor() {
            this.items = [];
            this.lastUpdate = 0;
    
            this.refresh();
        }
        
        /**
         * Reloads the inventory.
         */
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
        
        /**
         * Clears the error on screen.
         */
        clearError() {
            let $error = $("#inventory #error");

            $error.addClass("invisible");
        }
    
        /**
         * Shows an error on screen.
         * @param {String} text The error message.
         */
        setError(text) {
            let $error = $("#inventory #error");

            $error.text(text);
            $error.removeClass("invisible");
        }
    }

    /**
     * The player's attributes.
     */
    #PlayerAttributes = class PlayerAttributes {
        constructor() {
            this.attributes = [];
            this.lastUpdate = 0;

            this.refresh();
        }

        /**
         * Reloads the player's attributes.
         */
        async refresh() {
            let response = await Base.commune("getAttributes", { _lastUpdate: this.lastUpdate });
            if (response.status === "success") {
                this.lastUpdate = response.lastUpdate;
                this.attributes = response.data;
    
                this.render();
            }
        }

        /**
         * Renders the attributes.
         */
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

    /**
     * Services for the player's account.
     */
    #AccountServices = class AccountServices {
        constructor() {
            this.username = "";
            this.email = "";
            this.lastUpdate = 0;
            
            this.refresh();
        }
    
        /**
         * Reloads the player's basic info.
         */
        async refresh() {
            let response = await Base.commune("getInfo", { _lastUpdate: this.lastUpdate });
            if (response.status === "success") {
                this.lastUpdate = response.lastUpdate;
                this.email = response.data.email;
                this.username = response.data.username;
            }

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
    
        /**
         * Initiates email editing.
         */
        editEmail() {
            let $emailSetting = $(".content#account .setting#email");
            let $emailEdit = $(".content#account .edit#email");

            $emailSetting.addClass("invisible");
            $emailEdit.removeClass("invisible");
        }
    
        /**
         * Cancels editing the email.
         */
        cancelEmail() {
            let $email = $(".content#account .setting#email p");
            let $emailSetting = $(".content#account .setting#email");
            let $emailEdit = $(".content#account .edit#email");
            let $emailInput = $(".content#account .edit#email input");

            $emailSetting.removeClass("invisible");
            $emailEdit.addClass("invisible");
            $emailInput.val($email.text());
        }
    
        /**
         * Confirms and submits an email edit.
         */
        async updateEmail() {
            let $info = $(".content#account #info");
            let $email = $(".content#account .setting#email p");
            let $emailInput = $(".content#account .edit#email input");

            let response = await Base.commune("changeEmail", { email: $emailInput.val() });
    
            if (response.status === "success") {
                this.email = $emailInput.val();
                $email.text($emailInput.val());
                $info.text("Email Updated.");
            }
            else {
                $info.text("Email Not Updated!");
            }
            this.cancelEmail();
        }
    
        /**
         * Initiates username editing.
         */
        editUsername() {
            let $usernameSetting = $(".content#account .setting#username");
            let $usernameEdit = $(".content#account .edit#username");

            $usernameSetting.addClass("invisible");
            $usernameEdit.removeClass("invisible");
        }
    
        /**
         * Cancels username editing.
         */
        cancelUsername() {
            let $usernameSetting = $(".content#account .setting#username");
            let $usernameEdit = $(".content#account .edit#username");
            let $usernameInput = $(".content#account .edit#username input");
            let $username = $(".content#account .setting#username p");

            $usernameSetting.removeClass("invisible");
            $usernameEdit.addClass("invisible");
            $usernameInput.val($username.text());
        }
    
        /**
         * Confirms and submits a username edit.
         */
        async updateUsername() {
            let $info = $(".content#account #info");
            let $username = $(".content#account .setting#username p");
            let $usernameInput = $(".content#account .edit#username input");

            let response = await Base.commune("changeUsername", { username: $usernameInput.val() });
    
            if (response.status === "success") {
                this.username = $usernameInput.val();
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

        this.switchTab("inventory");
    }

    /**
     * Closes the menu.
     */
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

    /**
     * Opens the menu.
     */
    openMenu = () => {
        let $menu = $(".ui .menu");
        let $fade = $(".ui .fade");

        $menu.removeClass("invisible");
        $fade.removeClass("camo");
        $fade.removeClass("invisible");
    }

    /**
     * Switches tabs in the menu.
     * @param {String} id The name of the tab to switch to.
     */
    switchTab = function switchTab(id) {
        $("#content-window .content").addClass("invisible");
        $(".menu .tabs button").removeClass("selected");
        $(`#content-window #${id}`).removeClass("invisible");
        $(`.menu .tabs #${id}`).addClass("selected");
    }
    
    /**
     * Communes to logout.
     * @returns Communion response.
     */
    logout = async () => {
        let response = await Base.commune("logout");

        return response;
    }

    /**
     * Communes to register a new account.
     * @param {String} email The user's email address.
     * @param {String} username The user's display name.
     * @param {String} password The user's ****.
     * @returns Communion response.
     */
    attemptRegister = async (email, username, password) => {
        let response = await Base.commune("register", { 
            email, username, password 
        });
        
        return response;
    }

    /**
     * Communes to login.
     * @param {String} email The user's email address.
     * @param {String} password The user's password.
     * @returns Communion response.
     */
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

    /**
     * Communes to send a password reset email.
     * @param {String} email The user's email.
     * @param {Boolean} test Debug mode
     * @returns Communion response.
     */
    resetPassword = async (email, test = false) => {
        let response = await Base.commune("sendPasswordReset", { email, test });
        
        return response;
    }

    /**
     * Communes to finalize a password change.
     * @param {Number} token The password reset token.
     * @param {String} email The user's email address.
     * @param {String} password The user's new password.
     * @param {String} confirmation Confirmation of the user's new password.
     * @returns Communion response.
     */
    changePassword = async (token, email, password, confirmation) => {
        let response = await Base.commune("changePassword", { token, email, password, confirmation });
        
        return response;
    }

    /**
     * Runs a script on the server.
     * @param {String} what The script to run.
     * @param {Object} data Data to send as input for the script.
     * @returns Communion response.
     */
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

    /**
     * Loads all spirits of a certain service.
     * @param {String} service The name of the spirits to load.
     * @param {String} scope Defaults to local, else global.
     * @returns Spirit world response.
     */
    loadAll = async (service, scope = "local", data = {}, id = null) => {
        let response = await $.post("/s/loadAll", JSON.stringify({ service, scope, data, id }));

        return response;
    }
}