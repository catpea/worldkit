import Koa from "koa";
import Router from "koa-router";

import render from "koa-ejs";
import serve from "koa-static";
import mount from "koa-mount";
import logger from "koa-logger";


import { readFile } from 'fs/promises';

// for passport support
import session from "koa-session";

import bodyParser from "koa-bodyparser";
import passport from "koa-passport";
import LocalStrategy from "passport-local";

import foundation from "./plugins/foundation/index.js";
import authentication from "./plugins/authentication/index.js";

import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const config = JSON.parse(await readFile('./config.json'));

const app = new Koa();
app.use(logger())






// the auth model for passport support
// if we have a port other than 80, add it to our callback url
let port = "";

if (config.site.port !== 80) {
	port = `:${config.site.port}`;
}

passport.serializeUser((user, done) => {
	done(null, user);
});

passport.deserializeUser((user, done) => {
	done(null, user);
});





import {Strategy as GithubStrategy} from "passport-github";

passport.use(new GithubStrategy({
	clientID: config.site.oauth.github.clientID,
	clientSecret: config.site.oauth.github.clientSecret,
	callbackURL: `${config.site.oauth.host}${port}/auth/github/callback`
}, (token, tokenSecret, profile, done) => {
	// retrieve user ...
	done(null, profile);
}));

import Auth0Strategy from "passport-auth0";

passport.use(new Auth0Strategy({
	domain: config.site.oauth.auth0.domain,
	clientID: config.site.oauth.auth0.clientID,
	clientSecret: config.site.oauth.auth0.clientSecret,
	callbackURL: `${config.site.oauth.host}${port}/auth/auth0/callback`
}, (accessToken, refreshToken, extraParams, profile, done) => {
	// retrieve user ...
	done(null, profile);
}));

// app.use(async ctx => {
//   ctx.state.copyright_year = new Date().getFullYear();
//   ctx.state.site_name = config.site.name;
//   ctx.state.wwwroot = config.site.wwwroot;
//   ctx.state.analytics = config.site.analytics;
// })


app.use(function (ctx, next) {
  ctx.state.author = config.site.author;
  ctx.state.copyright_year = new Date().getFullYear();
  ctx.state.site_name = config.site.name;
  ctx.state.wwwroot = config.site.wwwroot;
  ctx.state.analytics = config.site.analytics;

  ctx.state.scripts = [];
  ctx.state.vendor_js = [];
  ctx.state.vendor_css = [];

  return next();
});


// trust proxy
app.proxy = true;

// sessions
app.keys = [config.site.secret];
app.use(session(app));

// body parser
app.use(bodyParser());

// authentication
app.use(passport.initialize());
app.use(passport.session());

// statically serve assets
app.use(mount("/assets", serve("./assets")));



render(app, {
  root: path.join(__dirname, 'view'),
  layout: 'template',
  viewExt: 'html',
  cache: false,
  debug: true,
	strict: false,
});


// Error handling middleware
// app.use(async(ctx, next) => {
// 	try {
// 		await next();
// 		if (ctx.state.api === true && ctx.status === 200) {
// 			ctx.body = {
// 				error: false,
// 				result: ctx.body
// 			};
// 		}
// 	} catch (err) {
// 		ctx.app.emit("error", err, this);
// 		ctx.status = err.status || 500;
// 		if (ctx.state.api === true) {
// 			return ctx.body = {
// 				error: true,
// 				message: 'API' + err.message
// 			};
// 		}
// 		await ctx.render("error", {
// 			message: 'MSG:' + err.message,
// 			error: {}
// 		});
// 	}
// });

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = err.statusCode || err.status || 500;
		console.log(err);
		await ctx.render("error", {
			name: err.name,
			message: err.message,
			stack: err.stack
		});
  }
})












const router = new Router();



class Database {
    constructor() {
    }
		get(username, next){
			next({})
		}
}

const db = new Database();



passport.use(new LocalStrategy(function verify(username, password, done) {

	if ( (username == 'admin') && (password == 'admin') ){
		var user = {
			id: 1,
			username: 'admin'
		};
		return done(null, user);
	}else{
		return done(null, false);
	}

		if (!user) { return done(null, false); }
		if (!user.verifyPassword(password)) { return done(null, false); }

		return done(null, user);

}));













// routes

router.get("/", async(ctx) => {

  console.log('Get / triggered');

	let user;

	if (ctx.isAuthenticated()) {
		user = ctx.session.passport.user;
	}

	await ctx.render("index", {
		title: config.site.name,
		user: user
	});

});

router.get("/r/:id", async(ctx) => {

	let user;
	if (ctx.isAuthenticated()) {
		user = ctx.session.passport.user;
	}

	const objects = [
		{
			type: 'bot',
			name: 'Alice',
			title: 'Uploading Images',
			message: 'Heads up! if you are trying to upload an image for a contest, make sure it is cropped.',
			links:[
				{title:'Upload Now', url:'/r/members/contests/upload/confirm'}
			]
		}
	];


	await ctx.render("room", {
		title: config.site.name,
		user: user,
		objects,
	});

});










// for passport
router.get("/login", async(ctx) => {
	let user;
	if (ctx.isAuthenticated()) {
		user = ctx.session.passport.user;
	}
	await ctx.render("login", {
		user: user
	});
});
router.get("/logout", async(ctx) => {
	ctx.logout();
	await ctx.redirect("/");
});
router.get("/account", async(ctx) => {
	let user;

	if (ctx.isAuthenticated()) {
		user = ctx.session.passport.user;
	} else {
		return ctx.redirect("/");
	}

	await ctx.render("account", {
		title: config.site.name,
		user: JSON.stringify(user, null, 2)
	});
});

// you can add as many strategies as you want

router.post("/auth/local",
		passport.authenticate('local'),
);

router.get("/auth/local/callback",
	passport.authenticate('local', {
		successRedirect: "/account",
	 successReturnToOrRedirect: '/account',
	 failureRedirect: '/',
	 failureMessage: true
	})
);



router.get("/auth/github",
	passport.authenticate("github")
);

router.get("/auth/github/callback",
	passport.authenticate("github", {
		successRedirect: "/account",
		failureRedirect: "/"
	})
);



router.get("/auth/auth0",
	passport.authenticate("auth0", {
		clientID: config.site.oauth.auth0.clientID,
		domain: config.site.oauth.auth0.domain,
		responseType: "code",
		audience: `https://${config.site.oauth.auth0.domain}/userinfo`,
		scope: "openid profile"
	})
);

router.get("/auth/auth0/callback",
	passport.authenticate("auth0", {
		successRedirect: "/account",
		failureRedirect: "/"
	})
);




app.use(router.routes());
app.use(router.allowedMethods());



console.log(router.routes().router.stack.map(i=>i.path));











console.log(`${config.site.name} is now listening on port ${config.site.port}`);
app.listen(config.site.port);

process.on("SIGINT", function exit() {
	process.exit();
});
