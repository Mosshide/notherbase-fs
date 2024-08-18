import NotherBaseFS from "./notherbase-fs.js";
import { fileURLToPath } from 'node:url';

const notherBaseFS = new NotherBaseFS({}, {
    notherbase: {
        directory: fileURLToPath(new URL('./test', import.meta.url)),
        icon: '/public/drum.png'
    },
    test: {
        directory: fileURLToPath(new URL('./test2', import.meta.url)),
        icon: '/public/drum.png'
    }
});