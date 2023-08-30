module.exports = () => ({
  email: {
    config: {
      provider: 'nodemailer',
      providerOptions: {
        host: 'smtp.example.com',
        port: 587,
        auth: {
          user: 'test',
          pass: 'test',
        },
      },
      settings: {
        defaultFrom: 'website@binarycoffee.dev',
        defaultReplyTo: 'website@binarycoffee.dev',
      },
    }
  }
});
