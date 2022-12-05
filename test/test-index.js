import path from 'node:path';
import NotherBaseFS from "../notherbase-fs.js";
import { fileURLToPath } from 'node:url';
const __dirname = fileURLToPath(new URL('./', import.meta.url));
console.log(__dirname);

const notherBaseFS = new NotherBaseFS(__dirname, `${__dirname}void`, __dirname, `${__dirname}pages`);