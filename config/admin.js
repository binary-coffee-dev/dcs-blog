module.exports = ({env}) => ({
  autoOpen: false,
  auth: {
    secret: env('ADMIN_JWT_SECRET', '6V#j7xt3ZHBgBphIiwv2')
  }
});
