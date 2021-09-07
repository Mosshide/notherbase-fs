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

let from = function from(currentDirectory) {
    dir = currentDirectory;
    let newRouter = require("express").Router();
    router = newRouter;

    return {
        explore: explore,
        router: newRouter
    };
}

module.exports = {
    from: from
}