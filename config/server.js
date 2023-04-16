module.exports = ({env}) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  cron: {
    enabled: true
  },
  admin: {
    autoOpen: false,
  //   auth: {
  //     secret: env('ADMIN_JWT_SECRET', '6V#j7xt3ZHBgBphIiwv2')
  //   }
  }
});
