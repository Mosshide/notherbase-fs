let router;
let dir;

let explore = function explore(route, styles = [], scripts = []) {
    styles = styles.map(style => {
        style = `${dir}/styles/${style}`;
        return style;
    });

    scripts = scripts.map(script => {
        script = `${dir}/local-scripts/${script}`;
        return script;
    });

    let main = "index";
    if (route !== "") main = route;

    router.get(`/${route}`, async function(req, res) {
        try {
            res.render(`explorer`, 
            {
                siteTitle: "NotherBase",
                user: null,
                styles: styles,
                main: `${dir}/views/${main}`,
                scripts: scripts
            });
        }
        catch(err) {
            console.log(err);
        }
    });
}

let to = function to() {
    console.log(router);
    return Object.assign({}, router);
}

let from = function from(currentDirectory) {
    dir = currentDirectory;
    router = require("express").Router();

    return {
        explore: explore,
        to: to
    };
}

module.exports = {
    from: from
}