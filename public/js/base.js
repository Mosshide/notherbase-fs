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
            username: null
        };
    }

    /**
     * Communes to logout.
     * @returns Communion response.
     */
    logout = async (test = false) => {
        let response = await Base.commune("logout");

        if (!test) location.reload();
        else {
            this.playerAccount.username = null;
            this.updateLoginStatus();
            return response;
        }
    }

    /**
     * Communes to register a new account.
     * @param {String} email The user's email address.
     * @param {String} username The user's display name.
     * @param {String} password The user's ****.
     * @returns Communion response.
     */
    attemptRegister = async (username, password) => {
        let response = await Base.commune("register", { 
            username, password 
        });
        
        return response;
    }

    /**
     * Communes to login.
     * @param {String} email The user's email address.
     * @param {String} password The user's password.
     * @returns Communion response.
     */
    attemptLogin = async (username, password) => {
        let response = await Base.commune("login", {
            username, password
        });

        if (response.status === "success") {
            this.playerAccount.username = response.data;
            this.updateLoginStatus(response.data);
        }
        
        return response;
    };

    /**
     * Communes to finalize a password change.
     * @param {Number} token The password reset token.
     * @param {String} email The user's email address.
     * @param {String} password The user's new password.
     * @param {String} confirmation Confirmation of the user's new password.
     * @returns Communion response.
     */
    changePassword = async (oldPassword, newPassword, confirmation) => {
        let response = await Base.commune("changePassword", { oldPassword, newPassword, confirmation });
        
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
     * Saves a spirit of a certain service.
     * @param {String} service The name of the spirit to save.
     * @param {String} scope Defaults to local, else global.
     * @param {Object} data Data to save the spirit with.
     * @param {ObjectID} id The id of the spirit to save.
     * @returns Spirit world response.
     */
    save = async (service, scope = "local", data = {}, id = null) => {
        let response = await $.post("/s/save", JSON.stringify({ service, scope, data, id }));
        return response;
    }

    /**
     * Appends html to the head.
     * @param {String} html The html to append.
     */
    appendToHead = (html) => {
        $("head").append($(html));
    }

    //update login status
    updateLoginStatus = (name = null) => {
        let $status = $("footer .login-status");
        let $logout = $("footer .logout");

        if (name) {
            $status.text(`Logged In: ${name}`);
            $logout.removeClass("invisible");
        }
        else {
            $status.text("Not Logged In");
            $logout.addClass("invisible");
        }
    }

    // download your data
    downloadData = async () => {
        let response = await Base.commune("downloadData");

        if (response.status === "success") {
            let blob = new Blob([JSON.stringify(response.data)], { type: "application/json" });
            let url = URL.createObjectURL(blob);
            let a = document.createElement("a");
            a.href = url;
            a.download = "data.json";
            document.body.appendChild(a);
            a.click();
            URL.revokeObjectURL(url);
            a.remove();
        }

        return response;
    }

    deleteData = async (password) => {
        let response = await Base.commune("deleteAlldata", { password });

        return response;
    }

    importData = async (password, data) => {
        let text = await data.text(data);
        
        let response = await Base.commune("importData", { password, data: text });
        return response;
    }

    sendOTP = async () => {
        let response = await Base.commune("sendOTP");

        return response;
    }

    changeEmail = async (password, email) => {
        let response = await Base.commune("changeEmail", { password, email });

        return response;
    }
}