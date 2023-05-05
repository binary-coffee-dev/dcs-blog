module.exports = ({env}) => ({
  autoOpen: false,
  prefix: '',
  auth: {
    secret: env('ADMIN_JWT_SECRET', '6V#j7xt3ZHBgBphIiwv2')
  },
  apiToken: {
    salt: env('API_TOKEN_SALT', 'asdf234rqsdr32wetw3tr3'),
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT', 'asdfasdf2342twdr'),
    },
  },
});
