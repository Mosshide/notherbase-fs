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
                main: `${dir}5/views/${main}`,
                scripts: scripts
            });
        }
        catch(err) {
            console.log(err);
        }
    });
}

let from = function from(currentDirectory) {
    dir = currentDirectory;
    router = require("express").Router();

    return {
        explore: explore,
        router: router
    };
}

module.exports = {
    from: from
}