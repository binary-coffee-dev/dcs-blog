const MUTATION_CREATE_OPINION = {
  operationName: null,
  // language=GraphQL
  query: 'mutation ($post: ID, $user: ID, $type: String){\n  createOpinion(data: {post: $post, user: $user, type: $type}){\n    data {\n      id\n    }\n  }\n}'
};

async function request(strapi, chai, variables, jwt) {
  return await new Promise((resolve, reject) => {
    chai.request(strapi.server.httpServer)
      .post('/graphql')
      .set('Authorization', `Bearer ${jwt}`)
      .send({...MUTATION_CREATE_OPINION, variables})
      .end((err, res) => err ? reject(err) : resolve(res));
  });
}

module.exports = async function createOpinionRequest(strapi, chai, variables, jwt) {
  const res = await request(strapi, chai, variables, jwt);
  return res.body.data.createOpinion.data;
};

module.exports.request = request;
module.exports.MUTATION_CREATE_OPINION = MUTATION_CREATE_OPINION;
module.exports.LIKE = 'like';
