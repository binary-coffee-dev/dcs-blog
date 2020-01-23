module.exports = {
  definition: `
    type CaptchaSchema {
      captcha: String
      token: String
    }
  `,
  query: `captcha : CaptchaSchema!`,
  resolver: {
    Query: {
      captcha: {
        resolver: 'Comment.captcha'
      }
    }
  }
};
