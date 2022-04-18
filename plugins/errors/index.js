export default function main({ app }) {

  app.use(async (ctx, next) => {
    try {
      await next();
    } catch (err) {
      ctx.status = err.statusCode || err.status || 500;
  		//console.log(err);
  		await ctx.render("error", {
  			name: err.name,
  			message: err.message,
  			stack: err.stack
  		});
    }
  })

}
