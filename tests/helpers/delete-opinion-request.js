const MUTATION_REMOVE_OPINION = {
  operationName: null,
  query: 'mutation ($id: ID!){\n  deleteOpinion(id: $id){\n    data {\n      id\n    }\n  }\n}'
};

async function request(strapi, chai, variables, jwt) {
  return await new Promise(resolve => {
    chai.request(strapi.server.httpServer)
      .post('/graphql')
      .set('Authorization', `Bearer ${jwt}`)
      .send({...MUTATION_REMOVE_OPINION, variables})
      .end((err, res) => resolve(res));
  });
}

module.exports = async function deleteOpinionRequest(strapi, chai, variables, jwt) {
  const res = await request(strapi, chai, variables, jwt);
  return res.body.data;
};

module.exports.request = request;
