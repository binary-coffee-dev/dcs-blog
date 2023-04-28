module.exports = ({env}) => ({
  'users-permissions': {
    config: {
      jwtSecret: env('JWT_SECRET', 'a1e3ed3e-09b0-41d5-8c1e-d21fd0319b4c'),
      jwt: {
        expiresIn: '7d',
      }
    }
  }
});
