const chai = require('chai');
const chaiHttp = require('chai-http');

const createUser = require('../../helpers/create-user');
const generateJwt = require('../../helpers/generate-jwt-by-user');

chai.use(chaiHttp);

const expect = chai.expect;

const MUTATION_UPDATE_USER = {
  operationName: null,
  variables: {},
  // language=GraphQL
  query: 'mutation ($id: ID!, $data: UsersPermissionsUserInput!) {\n    updateUsersPermissionsUser(id: $id, data: $data) {\n        data {\n            id\n            attributes {\n                username\n                email\n                confirmed\n                blocked\n                page\n                avatarUrl\n                avatar {\n                    data {\n                        attributes {\n                            url\n                        }\n                    }\n                }\n            }\n        }\n    }\n}\n'
};

describe('Update user INTEGRATION', () => {

  after(async () => {
    await strapi.query('api::provider.provider').deleteMany({});
    await strapi.query('plugin::users-permissions.user').deleteMany({});
  });

  it('should update my page', async () => {
    const provider = await strapi.query('api::provider.provider').create({data: {provider: 'github'}});
    const NEW_PAGE = 'http://my-new-page';
    const OLD_PAGE = 'http://my-page';
    let user = await createUser({strapi, provider, page: OLD_PAGE});

    const jwt = generateJwt(strapi, user);
    const res = await new Promise((resolve, reject) => {
      chai.request(strapi.server.httpServer)
        .post('/graphql')
        .set('Authorization', `Bearer ${jwt}`)
        .send({...MUTATION_UPDATE_USER, variables: {id: user.id, data: {page: NEW_PAGE}}})
        .end((err, res) => err ? reject(err) : resolve(res));
    });

    expect(res.body.errors).to.be.undefined;
    expect(res.body.data).not.undefined.and.not.null;
    const userUpdated = await strapi.query('plugin::users-permissions.user').findOne({where: {id: user.id}});
    expect(userUpdated.page).to.be.equal(NEW_PAGE);
  });

  it('should not update any user data different from the page', async () => {
    const provider = await strapi.query('api::provider.provider').create({data: {provider: 'github'}});
    const OLD_EMAIL = 'old@email.com';
    const OLD_NAME = 'oldname';
    const OLD_CONFIRMED = true;
    let user = await createUser({strapi, provider, data: {email: OLD_EMAIL, name: OLD_NAME, confirmed: OLD_CONFIRMED}});

    const jwt = generateJwt(strapi, user);
    const res = await new Promise((resolve, reject) => {
      chai.request(strapi.server.httpServer)
        .post('/graphql')
        .set('Authorization', `Bearer ${jwt}`)
        .send({...MUTATION_UPDATE_USER, variables: {id: user.id, data: {email: 'new@email.com', name: 'newname', confirmed: false}}})
        .end((err, res) => err ? reject(err) : resolve(res));
    });

    expect(res.body.errors).to.be.undefined;
    expect(res.body.data).not.undefined.and.not.null;
    const userUpdated = await strapi.query('plugin::users-permissions.user').findOne({where: {id: user.id}});
    expect(userUpdated.email).to.be.equal(OLD_EMAIL);
    expect(userUpdated.name).to.be.equal(OLD_NAME);
    expect(userUpdated.confirmed).to.be.equal(OLD_CONFIRMED);
  });

  it('should not update any user data from a different user', async () => {
    const provider = await strapi.query('api::provider.provider').create({data: {provider: 'github'}});
    let user = await createUser({strapi, provider});
    let user2 = await createUser({strapi, provider});

    const jwt = generateJwt(strapi, user2);
    const res = await new Promise((resolve, reject) => {
      chai.request(strapi.server.httpServer)
        .post('/graphql')
        .set('Authorization', `Bearer ${jwt}`)
        .send({...MUTATION_UPDATE_USER, variables: {id: user.id, data: {email: 'new@email.com', name: 'newname', confirmed: false, page: 'http://new-page'}}})
        .end((err, res) => err ? reject(err) : resolve(res));
    });

    expect(res.body.errors).not.undefined;
    expect(res.body.errors[0].message).to.be.equal('Policy Failed');
  });
});
