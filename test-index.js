import NotherBaseFS from "./notherbase-fs.js";
import { fileURLToPath } from 'node:url';

const notherBaseFS = new NotherBaseFS({}, {
    notherbase: {
        directory: fileURLToPath(new URL('./test', import.meta.url)),
        favicon: '/public/drum.png'
    },
    test: {
        directory: fileURLToPath(new URL('./test', import.meta.url)),
        favicon: '/public/drum.png'
    }
});