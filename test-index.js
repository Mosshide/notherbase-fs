import NotherBaseFS from "./notherbase-fs.js";
import { fileURLToPath } from 'node:url';

const notherBaseFS = new NotherBaseFS({}, [
    {
        subdomain: "test",
        directory: fileURLToPath(new URL('./test', import.meta.url)),
        favicon: '/public/drum.png'
    }
]);