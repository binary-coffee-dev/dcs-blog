const chai = require('chai');
const chaiHttp = require('chai-http');

const createUser = require('../../helpers/create-user');
const generateJwt = require('../../helpers/generate-jwt-by-user');
const updatePostRequest = require('../../helpers/update-post-request');
const createPostRequest = require('../../helpers/create-post-request');

chai.use(chaiHttp);

const expect = chai.expect;

const QUERY_GET_POST_BY_NAME = {
  operationName: 'fetchPost',
  variables: {
    id: 'this-is-a-tests-yes'
  },
  // language=GraphQL
  query: 'query fetchPost($id: String!, $noUpdate: Boolean) {\n    postByName(name: $id, noUpdate: $noUpdate) {\n        title\n        body\n        author {\n            data {\n                id\n                attributes {\n                    username\n                    avatarUrl\n                }\n            }\n        }\n        banner {\n            data {\n                attributes {\n                    url\n                }\n            }\n        }\n        tags {\n            data {\n                id\n                attributes {\n                    name\n                }\n            }\n        }\n        enable\n        name\n        views\n        readingTime\n        comments\n        likes\n        createdAt\n        updatedAt\n        publishedAt\n    }\n}\n'
};

describe('Get post by name INTEGRATION', () => {
  let authUserOwner;
  let authUser;
  let staffUser;
  let adminUser;

  let postName;

  before(async () => {
    authUserOwner = await createUser({strapi});
    authUser = await createUser({strapi});
    staffUser = await createUser({strapi, roleType: 'staff'});
    adminUser = await createUser({strapi, roleType: 'administrator'});

    const jwt = generateJwt(strapi, authUserOwner);
    const postRes = await createPostRequest(strapi, chai, {enable: false}, jwt);
    postName = postRes.attributes.name;
  });

  after(async () => {
    await strapi.query('api::post.post').deleteMany({});
    await strapi.query('plugin::users-permissions.user').deleteMany({});
  });

  it('should calculate the read time in the new created comment', async () => {
    const jwt = generateJwt(strapi, authUserOwner);
    const postRes = await createPostRequest(strapi, chai, {
      body: 'Quia voluptatem quae assumenda earum atque deserunt corporis vitae esse perspiciatis cupiditate quia debitis ullam sed est nam odit tenetur sit sint nemo occaecati veritatis quis repellendus est aut aut est odio qui doloremque harum perferendis tenetur ipsa ut quia et dolores voluptates est aut voluptas sapiente maxime et rerum et explicabo voluptas voluptatum suscipit quaerat ducimus similique sunt in soluta ipsum qui minima vitae aut non est itaque assumenda voluptatibus sequi ab rerum ea architecto minus optio ad rerum quia soluta deleniti in facilis quod est et repudiandae ex vitae culpa eum harum est voluptatem et fugiat voluptates vel reprehenderit quo doloribus voluptas ut blanditiis velit fuga voluptatem corporis autem deleniti necessitatibus nemo consequatur quia veniam dolorem voluptas vitae cumque qui at similique aperiam enim blanditiis et voluptatum occaecati cumque nostrum necessitatibus earum qui autem aut architecto aut modi provident repellat asperiores voluptatem sequi quae ratione numquam laborum esse a a delectus sapiente omnis animi quo recusandae in quia ab eum minima in autem ut explicabo quia enim modi rerum dolor optio quae vel iste quos et fugiat tempore qui corrupti quas dolores cumque vero vitae totam corrupti ut sed dolores ipsam ut mollitia autem qui enim fuga illum.',
      title: 'this is a tests yes asdff asdf',
      enable: false
    }, jwt);
    expect(postRes.attributes.readingTime).to.be.equal(60);

    const postRes2 = await updatePostRequest(strapi, chai, {
      id: postRes.id,
      body: 'Dignissimos libero iste id rem qui quibusdam officiis facilis ea recusandae eum est qui minus et velit placeat omnis voluptates autem quasi dolorum nesciunt numquam nemo in deserunt esse maxime neque assumenda et ipsam provident mollitia est maiores distinctio et qui dolores eum ad dolores alias aliquid possimus placeat quos itaque vel quasi esse iure sapiente nesciunt praesentium facilis eaque vel ipsum quia ut sit consequuntur sed nemo in qui placeat et modi ut harum alias magni velit iure soluta sit tenetur sequi occaecati illum dolores suscipit illum ipsam voluptatem pariatur ut nostrum delectus quia officiis vitae doloribus quia laborum.'
    }, jwt);
    expect(postRes2.attributes.readingTime).to.be.equal(30);
  });

  it('should get the post by name the owner of the comment', async () => {
    const jwt = generateJwt(strapi, authUserOwner);
    const res = await new Promise((resolve, reject) => {
      chai.request(strapi.server.httpServer)
        .post('/graphql')
        .set('Authorization', `Bearer ${jwt}`)
        .send({...QUERY_GET_POST_BY_NAME, variables: {id: postName}})
        .end((err, res) => err ? reject(err) : resolve(res));
    });

    expect(res.body.data.postByName).not.undefined.and.not.null;
    expect(+res.body.data.postByName.author.data.id).to.equal(authUserOwner.id);
    expect(res.body.data.postByName.name).to.equal(postName);
  });

  it('should not update the view if the parameter no_updated is false', async () => {
    const jwt = generateJwt(strapi, authUserOwner);
    let initViews = Number.MAX_SAFE_INTEGER;
    for (let i = 0; i < 20; i++) {
      const res = await new Promise((resolve, reject) => {
        chai.request(strapi.server.httpServer)
          .post('/graphql')
          .set('Authorization', `Bearer ${jwt}`)
          .send({...QUERY_GET_POST_BY_NAME, variables: {id: postName, noUpdate: true}})
          .end((err, res) => err ? reject(err) : resolve(res));
      });
      if (initViews === Number.MAX_SAFE_INTEGER) {
        initViews = res.body.data.postByName.views;
      } else {
        expect(res.body.data.postByName.views).to.equal(initViews);
      }
    }
  });

  it('should not have access to an comment if the user is not the owner', async () => {
    const jwt = generateJwt(strapi, authUser);
    const res = await new Promise((resolve, reject) => {
      chai.request(strapi.server.httpServer)
        .post('/graphql')
        .set('Authorization', `Bearer ${jwt}`)
        .send({...QUERY_GET_POST_BY_NAME, variables: {id: postName}})
        .end((err, res) => err ? reject(err) : resolve(res));
    });
    expect(res.body.errors).to.be.undefined;
    expect(res.body.data.postByName).to.be.null;
  });

  it('should not have access to an comment a public user', async () => {
    const res = await new Promise((resolve, reject) => {
      chai.request(strapi.server.httpServer)
        .post('/graphql')
        .send({...QUERY_GET_POST_BY_NAME, variables: {id: postName}})
        .end((err, res) => err ? reject(err) : resolve(res));
    });
    expect(res.body.errors.length).to.be.equal(1);
    expect(res.body.errors[0].message).to.be.equal('Forbidden access');
    expect(res.body.data.postByName).to.be.null;
  });

  it('should get the post an user with staff role', async () => {
    const jwt = generateJwt(strapi, staffUser);
    const res = await new Promise((resolve, reject) => {
      chai.request(strapi.server.httpServer)
        .post('/graphql')
        .set('Authorization', `Bearer ${jwt}`)
        .send({...QUERY_GET_POST_BY_NAME, variables: {id: postName}})
        .end((err, res) => err ? reject(err) : resolve(res));
    });
    expect(res.body.data.postByName).not.undefined;
    expect(+res.body.data.postByName.author.data.id).to.equal(authUserOwner.id);
    expect(res.body.data.postByName.name).to.equal(postName);
  });

  it('should get the post an user with admin role', async () => {
    const jwt = generateJwt(strapi, adminUser);
    const res = await new Promise((resolve, reject) => {
      chai.request(strapi.server.httpServer)
        .post('/graphql')
        .set('Authorization', `Bearer ${jwt}`)
        .send({...QUERY_GET_POST_BY_NAME, variables: {id: postName}})
        .end((err, res) => err ? reject(err) : resolve(res));
    });
    expect(res.body.data.postByName).not.undefined;
    expect(+res.body.data.postByName.author.data.id).to.equal(authUserOwner.id);
    expect(res.body.data.postByName.name).to.equal(postName);
  });
});
