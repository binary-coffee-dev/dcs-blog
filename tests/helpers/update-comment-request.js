const randomName = require('./random-name');

const MUTATION_UPDATE_COMMENT = {
  operationName: null,
  // language=GraphQL
  query: 'mutation ($id: ID!, $body: String){\n    updateComment(id: $id, data: {body: $body}){\n        data {\n            id\n            attributes {\n                body\n                user {\n                    data {\n                        id\n                    }\n                }\n            }\n        }\n    }\n}'
};

async function request(strapi, chai, variables, jwt) {
  return await new Promise((resolve, reject) => {
    chai.request(strapi.server.httpServer)
      .post('/graphql')
      .set('Authorization', `Bearer ${jwt}`)
      .send({...MUTATION_UPDATE_COMMENT, variables: {body: randomName(), ...variables}})
      .end((err, res) => err ? reject(err) : resolve(res));
  });
}

module.exports = async function updateCommentRequest(strapi, chai, variables, jwt) {
  const res = await request(strapi, chai, variables, jwt);
  return res.body.data.updateComment.data;
};

module.exports.request = request;
