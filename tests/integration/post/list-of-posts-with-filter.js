const chai = require('chai');
const chaiHttp = require('chai-http');

const createUser = require('../../helpers/create-user');
const createPost = require('../../helpers/create-post');
const generateJwt = require('../../helpers/generate-jwt-by-user');

chai.use(chaiHttp);

const expect = chai.expect;

const QUERY = {
  operationName: null,
  variables: {
    limit: 10,
    start: 0,
    filters: {},
    sort: ['publishedAt:desc'],
  },
  // language=GraphQL
  query: 'query ($limit: Int!, $start: Int!, $filters: PostFiltersInput!, $sort: [String]){\n    posts(filters: $filters, pagination: {limit: $limit, start: $start}, sort: $sort, publicationState: PREVIEW) {\n        data {\n            id\n            attributes {\n                title\n                name\n                body\n                comments\n                likes\n                views\n                createdAt\n                updatedAt\n                publishedAt\n                enable\n                banner {\n                    data {\n                        id\n                        attributes {\n                            url\n                        }\n                    }\n                }\n                author {\n                    data {\n                        id\n                        attributes {\n                            username\n                            email\n                            page\n                        }\n                    }\n                }\n                tags {\n                    data {\n                        id\n                        attributes {\n                            name\n                        }\n                    }\n                }\n            }\n        }\n        meta {\n            pagination {\n                total\n            }\n        }\n    }\n}'
};

describe('Post list filtered (dashboard list) INTEGRATION', () => {

  after(async () => {
    await strapi.query('api::post.post').deleteMany({});
    await strapi.query('plugin::users-permissions.user').deleteMany({});
  });

  it('should get the list of post filter by user', async () => {
    const authUser = await createUser({strapi});
    await createPost(strapi, {author: authUser.id});
    await createPost(strapi, {author: authUser.id});
    await createPost(strapi);

    const jwt = generateJwt(strapi, authUser);
    const res = await new Promise(resolve => {
      chai.request(strapi.server.httpServer)
        .post('/graphql')
        .set('Authorization', `Bearer ${jwt}`)
        .send({...QUERY, variables: {...QUERY.variables, filters: {author: {id: {eq: authUser.id}}}}})
        .end((err, res) => resolve(res));
    });

    for (let post of res.body.data.posts.data) {
      expect(post.attributes.author).not.null;
      expect(+post.attributes.author.data.id).to.be.equal(authUser.id);
    }
    expect(res.body.data.posts.meta.pagination.total).to.equal(2);
  });

  it('should get the list of post filter by title', async () => {
    const authUser = await createUser({strapi});
    await createPost(strapi, {author: authUser.id, title: 'TEST', publishedAt: null});
    await createPost(strapi, {author: authUser.id, title: 'TEST'});
    await createPost(strapi, {author: authUser.id, title: 'TEST SOME'});
    await createPost(strapi, {author: authUser.id, title: 'SOME TEST'});
    await createPost(strapi, {author: authUser.id, title: 'SOME TEST SOME'});
    await createPost(strapi, {author: authUser.id, title: 'SOME'});

    const res = await new Promise(resolve => {
      chai.request(strapi.server.httpServer)
        .post('/graphql')
        .send({...QUERY, variables: {...QUERY.variables, filters: {enable: {eq: true}, title: {contains: 'tEst'}}}})
        .end((err, res) => resolve(res));
    });

    expect(res.body.data.posts.data.length).to.equal(4);
    expect(res.body.data.posts.meta.pagination.total).to.equal(4);
  });
});
