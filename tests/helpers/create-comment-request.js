const randomName = require('./random-name');

const MUTATION_CREATE_COMMENT = {
  operationName: null,
  // language=GraphQL
  query: 'mutation create($body: String, $post: ID) {\n    createComment(data: {body: $body, post: $post}){\n        data {\n            id\n            attributes {\n                body\n                email\n                name\n                user {\n                    data {\n                        id\n                        attributes {\n                            username\n                        }\n                    }\n                }\n            }\n        }\n    }\n}'
};

async function request(strapi, chai, variables, jwt) {
  return await new Promise((resolve, reject) => {
    chai.request(strapi.server.httpServer)
      .post('/graphql')
      .set('Authorization', `Bearer ${jwt}`)
      .send({...MUTATION_CREATE_COMMENT, variables: {body: randomName(100), ...variables}})
      .end((err, res) => err ? reject(err) : resolve(res));
  });
}

module.exports = async function createCommentRequest(strapi, chai, variables, jwt) {
  const res = await request(strapi, chai, variables, jwt);
  return res.body.data.createComment.data;
};

module.exports.request = request;
