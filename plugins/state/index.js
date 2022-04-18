export default function main({config, app}) {

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

}
