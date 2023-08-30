const MUTATION_REMOVE_FILE = {
  operationName: null,
  // language=GraphQL
  query: 'mutation ($id: ID!){\n    removeFile(id: $id) {\n        data {\n            id\n        }\n    }\n}'
};

async function request(strapi, chai, variables, jwt) {
  return await new Promise((resolve, reject) => {
    chai.request(strapi.server.httpServer)
      .post('/graphql')
      .set('Authorization', `Bearer ${jwt}`)
      .send({...MUTATION_REMOVE_FILE, variables})
      .end((err, res) => err ? reject(err) : resolve(res));
  });
}

module.exports = async function deleteImageRequest(strapi, chai, variables, jwt) {
  return await request(strapi, chai, variables, jwt);
};

module.exports.request = request;
