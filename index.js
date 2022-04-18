import Koa from "koa";
import Router from "koa-router";
import render from "koa-ejs";
import serve from "koa-static";
import mount from "koa-mount";
import logger from "koa-logger";

import { readFile } from 'fs/promises';
import session from "koa-session";
import bodyParser from "koa-bodyparser";
import authentication from "./plugins/authentication/index.js";
import foundation from "./plugins/foundation/index.js";
import errors from "./plugins/errors/index.js";
import state from "./plugins/state/index.js";

import visit from "./plugins/visit/index.js";
import inbox from "./plugins/inbox/index.js";

import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const config = JSON.parse(await readFile('./config.json'));

const app = new Koa();

let port = "";
if (config.site.port !== 80) { port = `:${config.site.port}`; }
console.log(`${config.site.name} is now listening on port ${config.site.port}`);
app.listen(config.site.port);

app.use(logger())
app.proxy = true;
app.keys = [config.site.secret];
app.use(session(app));
app.use(bodyParser());
app.use(mount("/assets", serve("./assets")));

// configure templates
render(app, {
  root: path.join(__dirname, 'view'),
  layout: 'template',
  viewExt: 'html',
  cache: false,
  debug: false,
	strict: false,
});

// setup server basics
errors({config, app})
state({config, app})

const router = new Router();

authentication({config, app, router, port});
foundation({config, app, router});
visit({config, app, router, port});
inbox({config, app, router, port});

// plugin in the router
app.use(router.routes());
app.use(router.allowedMethods());

process.on("SIGINT", function exit() {
	process.exit();
});
