export default function main({config, app, router, passport}) {

  router.get("/inbox", async(ctx) => {

  	let user;

  	if (ctx.isAuthenticated()) {
  		user = ctx.session.passport.user;
  	}

  	await ctx.render("inbox", {
  		title: config.site.name,
  		user: user
  	});

  });

}
