export default function main({config, app, router, passport}) {

  router.get("/", async(ctx) => {

  	let user;
    if (ctx.isAuthenticated()) {
  		user = ctx.session.passport.user;
  	} else {
  		return ctx.redirect("/");
  	}

  	await ctx.render("index", {
  		title: config.site.name,
  		user: user
  	});

  });

}
