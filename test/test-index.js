import NotherBaseFS from "../notherbase-fs.js";
import { fileURLToPath } from 'node:url';
const __dirname = fileURLToPath(new URL('./', import.meta.url));

const notherBaseFS = new NotherBaseFS(`${__dirname}explorer`, `${__dirname}void`, `${__dirname}the-front`, `${__dirname}pages`);