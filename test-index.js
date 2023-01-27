import NotherBaseFS from "./notherbase-fs.js";
import { fileURLToPath } from 'node:url';
const __dirname = fileURLToPath(new URL('./test', import.meta.url));

const notherBaseFS = new NotherBaseFS(__dirname);