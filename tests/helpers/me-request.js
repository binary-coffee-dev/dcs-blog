const QUERY_MY_USER = {
  operationName: null,
  // language=GraphQL
  query: 'query{\n    myData {\n        id\n        username\n        email\n        avatarUrl\n        confirmed\n        blocked\n        role {\n            name\n            type\n        }\n        page\n        avatar {\n            url\n        }\n    }\n}'
};

module.exports = async function (strapi, chai, jwt) {
  const res = await new Promise((resolve, reject) => chai.request(strapi.server.httpServer)
    .post('/graphql')
    .set('Authorization', `Bearer ${jwt}`)
    .send(QUERY_MY_USER)
    .end((err, res) => err ? reject(err) : resolve(res)));
  chai.expect(res.body.data.myData).not.null.and.not.undefined;
  return res.body.data.myData;
};
