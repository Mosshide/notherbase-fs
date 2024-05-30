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
    
    constructor() {
        this.playerAccount = {
            username: null,
            email: null
        };

        this.$viewToggle = null;
        this.viewState = "compact";
    }

    /**
     * Communes to logout.
     * @returns Communion response.
     */
    logout = async (test = false) => {
        let response = await Base.commune("logout");

        if (!test) location.reload();
        else return response;
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
     * @param {Object} data Data to filter the spirits by.
     * @param {ObjectID} id The id of the spirit to load.
     * @returns Spirit world response.
     */
    loadAll = async (service, scope = "local", data = {}, id = null) => {
        let response = await $.post("/s/loadAll", JSON.stringify({ service, scope, data, id }));

        return response;
    }

    /**
     * Loads a single spirit of a certain service.
     * @param {String} service The name of the spirit to load.
     * @param {String} scope Defaults to local, else global.
     * @param {Object} data Data to filter the spirits by.
     * @param {ObjectID} id The id of the spirit to load.
     * @returns Spirit world response.
     */ 
    load = async (service, scope = "local", data = {}, id = null) => {
        let response = await $.post("/s/load", JSON.stringify({ service, scope, data, id }));

        return response;
    }

    /**
     * Creates the toggle view button.
     */
    createToggleViewButton = async () => {
        // add a button to the footer for toggling between compact and full view
        this.$viewToggle = $("<button>").addClass("view-toggle").text(">");
        this.$viewToggle.on("click", () => {
            this.toggleView();
        });
        $("footer").append(this.$viewToggle);

        Base.commune("getView").then((res) => {
            if (res.data === "full") this.toggleView(false);
        });
    }

    /**
     * Toggles the view between compact and full.
     * @param {Boolean} save Whether or not to save the view state.
     */
    toggleView = async (save = true) => {
        if (this.viewState === "compact") {
            this.viewState = "full";
            this.$viewToggle.text("<");
            $("main").addClass("full-view");
        }
        else {
            this.viewState = "compact";
            this.$viewToggle.text(">");
            $("main").removeClass("full-view");
        }
        
        if (save) Base.commune("setView", { view: this.viewState });
    }

    /**
     * Appends html to the head.
     * @param {String} html The html to append.
     */
    appendToHead = (html) => {
        $("head").append($(html));
    }
}