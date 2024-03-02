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
     * Services for the player's account.
     */
    #AccountServices = class AccountServices {
        constructor() {
            this.username = "";
            this.email = "";
            this.lastUpdate = 0;
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
        this.playerAccount = new this.#AccountServices();
    }

    /**
     * Communes to logout.
     * @returns Communion response.
     */
    logout = async () => {
        let response = await Base.commune("logout");

        location.reload();
        //return response;
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
            this.playerAccount.username = response.data;
            this.playerAccount.email = email;
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

    createToggleViewButton = async () => {
        Base.commune("getView").then((res) => {
            // add a button to the footer for toggling between compact and full view
            this.$viewToggle = $("<button>").addClass("view-toggle").text(">");
            this.$viewToggle.on("click", () => {
                this.toggleView();
            });
            $("footer").append(this.$viewToggle);

            if (res.data === "full") this.toggleView(false);
        });
    }

    toggleView = async (save = true) => {
        if (this.$viewToggle.text() === ">") {
            this.$viewToggle.text("<");
            $("main").addClass("full-view");
            if (save) Base.commune("setView", { view: "full" });
        }
        else {
            this.$viewToggle.text(">");
            $("main").removeClass("full-view");
            if (save) Base.commune("setView", { view: "compact" });
        }
    }
}