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
    id: 'this-is-a-test-yes'
  },
  // language=GraphQL
  query: 'query fetchPost($id: String!, $noUpdate: Boolean) {\n  postByName(name: $id, noUpdate: $noUpdate) {\n    id\n    name\n    title\n    body\n    published_at\n    views\n    tags {\n      id\n      name\n      __typename\n    }\n    comments\n    banner {\n      url\n      __typename\n    }\n    author {\n      id\n      username\n      email\n      avatarUrl\n      page\n      __typename\n    }\n    tags {\n      name\n      __typename\n    }\n    __typename\n  }\n}\n'
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
    postName = postRes.name;
  });

  after(async () => {
    await strapi.query('post').delete({});
    await strapi.query('user', 'users-permissions').delete({});
  });

  it('should calculate the read time in the new created article', async () => {
    const jwt = generateJwt(strapi, authUserOwner);
    const postRes = await createPostRequest(strapi, chai, {
      body: 'Quia voluptatem quae assumenda earum atque deserunt corporis vitae esse perspiciatis cupiditate quia debitis ullam sed est nam odit tenetur sit sint nemo occaecati veritatis quis repellendus est aut aut est odio qui doloremque harum perferendis tenetur ipsa ut quia et dolores voluptates est aut voluptas sapiente maxime et rerum et explicabo voluptas voluptatum suscipit quaerat ducimus similique sunt in soluta ipsum qui minima vitae aut non est itaque assumenda voluptatibus sequi ab rerum ea architecto minus optio ad rerum quia soluta deleniti in facilis quod est et repudiandae ex vitae culpa eum harum est voluptatem et fugiat voluptates vel reprehenderit quo doloribus voluptas ut blanditiis velit fuga voluptatem corporis autem deleniti necessitatibus nemo consequatur quia veniam dolorem voluptas vitae cumque qui at similique aperiam enim blanditiis et voluptatum occaecati cumque nostrum necessitatibus earum qui autem aut architecto aut modi provident repellat asperiores voluptatem sequi quae ratione numquam laborum esse a a delectus sapiente omnis animi quo recusandae in quia ab eum minima in autem ut explicabo quia enim modi rerum dolor optio quae vel iste quos et fugiat tempore qui corrupti quas dolores cumque vero vitae totam corrupti ut sed dolores ipsam ut mollitia autem qui enim fuga illum.',
      title: 'this is a test yes asdff asdf',
      enable: false
    }, jwt);
    expect(postRes.readingTime).to.be.equal(60);

    const postRes2 = await updatePostRequest(strapi, chai, {
      id: postRes.id,
      body: 'Dignissimos libero iste id rem qui quibusdam officiis facilis ea recusandae eum est qui minus et velit placeat omnis voluptates autem quasi dolorum nesciunt numquam nemo in deserunt esse maxime neque assumenda et ipsam provident mollitia est maiores distinctio et qui dolores eum ad dolores alias aliquid possimus placeat quos itaque vel quasi esse iure sapiente nesciunt praesentium facilis eaque vel ipsum quia ut sit consequuntur sed nemo in qui placeat et modi ut harum alias magni velit iure soluta sit tenetur sequi occaecati illum dolores suscipit illum ipsam voluptatem pariatur ut nostrum delectus quia officiis vitae doloribus quia laborum.'
    }, jwt);
    expect(postRes2.readingTime).to.be.equal(30);
  });

  it('should get the post by name the owner of the article', async () => {
    const jwt = generateJwt(strapi, authUserOwner);
    const res = await new Promise((resolve, reject) => {
      chai.request(strapi.server)
        .post('/graphql')
        .set('Authorization', `Bearer ${jwt}`)
        .send({...QUERY_GET_POST_BY_NAME, variables: {id: postName}})
        .end((err, res) => err ? reject(err) : resolve(res));
    });

    expect(!!res.body.data.postByName).to.be.true;
    expect(+res.body.data.postByName.author.id).to.equal(authUserOwner.id);
    expect(res.body.data.postByName.name).to.equal(postName);
  });

  it('should not update the view if the parameter no_updated is false', async () => {
    const jwt = generateJwt(strapi, authUserOwner);
    let initViews = Number.MAX_SAFE_INTEGER;
    for (let i = 0; i < 20; i++) {
      const res = await new Promise((resolve, reject) => {
        chai.request(strapi.server)
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

  it('should not have access to an article if the user is not the owner', (done) => {
    const jwt = generateJwt(strapi, authUser);
    chai.request(strapi.server)
      .post('/graphql')
      .set('Authorization', `Bearer ${jwt}`)
      .send({...QUERY_GET_POST_BY_NAME, variables: {id: postName}})
      .end((err, res) => {
        expect(!!res.body.data).to.be.false;
        done();
      });
  });

  it('should not have access to an article a public user', (done) => {
    chai.request(strapi.server)
      .post('/graphql')
      .send({...QUERY_GET_POST_BY_NAME, variables: {id: postName}})
      .end((err, res) => {
        expect(!!res.body.data).to.be.false;
        done();
      });
  });

  it('should get the post an user with staff role', (done) => {
    const jwt = generateJwt(strapi, staffUser);
    chai.request(strapi.server)
      .post('/graphql')
      .set('Authorization', `Bearer ${jwt}`)
      .send({...QUERY_GET_POST_BY_NAME, variables: {id: postName}})
      .end((err, res) => {
        expect(!!res.body.data.postByName).to.be.true;
        expect(+res.body.data.postByName.author.id).to.equal(authUserOwner.id);
        expect(res.body.data.postByName.name).to.equal(postName);
        done();
      });
  });

  it('should get the post an user with admin role', (done) => {
    const jwt = generateJwt(strapi, adminUser);
    chai.request(strapi.server)
      .post('/graphql')
      .set('Authorization', `Bearer ${jwt}`)
      .send({...QUERY_GET_POST_BY_NAME, variables: {id: postName}})
      .end((err, res) => {
        expect(!!res.body.data.postByName).to.be.true;
        expect(+res.body.data.postByName.author.id).to.equal(authUserOwner.id);
        expect(res.body.data.postByName.name).to.equal(postName);
        done();
      });
  });
});
