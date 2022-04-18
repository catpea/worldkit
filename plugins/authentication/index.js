import passport from "koa-passport";
import {Strategy as GithubStrategy} from "passport-github";
import Auth0Strategy from "passport-auth0";
import LocalStrategy from "passport-local";

export default function main({config, app, router, port}) {

  // authentication
  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user, done) => {
  	done(null, user);
  });

  passport.deserializeUser((user, done) => {
    console.log(user);
  	done(null, user);
  });

  passport.use(new GithubStrategy({
  	clientID: config.site.oauth.github.clientID,
  	clientSecret: config.site.oauth.github.clientSecret,
  	callbackURL: `${config.site.oauth.host}${port}/auth/github/callback`
  }, (token, tokenSecret, profile, done) => {
  	// retrieve user ...
  	done(null, profile);
  }));


  passport.use(new Auth0Strategy({
  	domain: config.site.oauth.auth0.domain,
  	clientID: config.site.oauth.auth0.clientID,
  	clientSecret: config.site.oauth.auth0.clientSecret,
  	callbackURL: `${config.site.oauth.host}${port}/auth/auth0/callback`
  }, (accessToken, refreshToken, extraParams, profile, done) => {
  	// retrieve user ...
  	done(null, profile);
  }));


  class Database {
      constructor() {
      }
  		get(username, next){
  			next({})
  		}
  }

  const db = new Database();

  passport.use(new LocalStrategy(function verify(username, password, done) {

    const validUser = ( (username == 'admin') && (password == 'admin') );

  	if (validUser) {
  		var user = { id: 1, username: 'admin' };
      return done(null, user);
  	}else{
      // error
  		return done(null, false);
  	}

  }));












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

  router.post("/auth/local", passport.authenticate('local'), async(ctx) => { await ctx.redirect("/account") });

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

  return {}

}
