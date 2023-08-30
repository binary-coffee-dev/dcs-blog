module.exports = ({env}) => ({
  'users-permissions': {
    config: {
      jwtSecret: env('JWT_SECRET', 'a1e3ed3e-09b0-41d5-8c1e-d21fd0319b4c'),
      jwt: {
        expiresIn: '7d',
      }
    }
  },
  email: {
    config: {
      provider: 'nodemailer',
      providerOptions: {
        host: env('SMTP_HOST', 'smtp.example.com'),
        port: env('SMTP_PORT', 587),
        auth: {
          user: env('SMTP_USERNAME', 'test'),
          pass: env('SMTP_PASSWORD', 'test'),
        },
      },
      settings: {
        defaultFrom: 'website@binarycoffee.dev',
        defaultReplyTo: 'website@binarycoffee.dev',
      },
    }
  }
});
