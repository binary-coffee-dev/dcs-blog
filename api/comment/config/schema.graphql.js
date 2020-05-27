module.exports = {
  definition: `
    type CaptchaSchema {
      captcha: String
      token: String
    }
    input createCommentByCaptchaInput {
      body: String
      email: String
      name: String
      post: ID
      captcha: String
      token: String
    }
  `,
  query: `
    captcha: CaptchaSchema!
    recentComments: [Comment]!
  `,
  mutation: 'createCommentByCaptcha(input: createCommentByCaptchaInput): createCommentPayload',
  resolver: {
    Query: {
      captcha: {
        resolver: 'Comment.captcha'
      },
      recentComments: {
        resolver: 'Comment.recentComments'
      }
    },
    Mutation: {
      createCommentByCaptcha: {
        resolver: 'Comment.createByCaptcha'
      }
    }
  }
};
