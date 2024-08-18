import NotherBaseFS from "./notherbase-fs.js";

const notherBaseFS = new NotherBaseFS({}, {
    notherbase: {
        directory: './test',
        icon: '/public/drum.png'
    },
    test: {
        directory: './test2',
        icon: '/public/drum.png'
    }
});