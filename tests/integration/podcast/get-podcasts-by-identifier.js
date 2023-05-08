const chai = require('chai');
const chaiHttp = require('chai-http');

const createUser = require('../../helpers/create-user');
const createEpisode = require('../../helpers/create-episode');
const generateJwt = require('../../helpers/generate-jwt-by-user');

chai.use(chaiHttp);

const expect = chai.expect;

const QUERY_GET_PODCAST_BY_IDENTIFIER = {
  variables: {},
  // language=GraphQL
  query: 'query ($identifier: String!) {\n    podcastByIdentifier(identifier: $identifier) {\n        name\n        episodes {\n            data {\n                id\n                attributes {\n                    title\n                    url\n                    duration\n                    description\n                    banner\n                    date\n                }\n            }\n        }\n        identifier\n        createdAt\n        updatedAt\n    }\n}'
};

describe('Get podcasts INTEGRATION', () => {
  let authUser;
  let staffUser;
  let adminUser;

  const NUMBER_OF_EPISODES = 10;

  before(async () => {
    authUser = await createUser({strapi});
    staffUser = await createUser({strapi, roleType: 'staff'});
    adminUser = await createUser({strapi, roleType: 'administrator'});

    const podcastIns = await strapi
      .query('api::podcast.podcast').create({data: {identifier: 'espacio-binario', name: 'Espacio Binario'}});
    for (let i = 0; i < NUMBER_OF_EPISODES; i++) {
      await createEpisode(strapi, podcastIns);
    }
  });

  after(async () => {
    await strapi.query('api::podcast.podcast').deleteMany({});
    await strapi.query('api::episode.episode').deleteMany({});
    await strapi.query('plugin::users-permissions.user').deleteMany({});
  });

  it('should get the podcast and the list of episodes (public user)', async () => {
    await testRequestPodcast();
  });

  it('should get the podcast and the list of episodes (auth user)', async () => {
    const jwt = generateJwt(strapi, authUser);
    await testRequestPodcast(jwt);
  });

  it('should get the podcast and the list of episodes (staff user)', async () => {
    const jwt = generateJwt(strapi, staffUser);
    await testRequestPodcast(jwt);
  });

  it('should get the podcast and the list of episodes (admin user)', async () => {
    const jwt = generateJwt(strapi, adminUser);
    await testRequestPodcast(jwt);
  });

  async function testRequestPodcast(jwt) {
    const res = await new Promise((resolve, reject) => {
      const req = chai.request(strapi.server.httpServer).post('/graphql');
      if (jwt) {
        req.set('Authorization', `Bearer ${jwt}`);
      }
      req.send({...QUERY_GET_PODCAST_BY_IDENTIFIER, variables: {identifier: 'espacio-binario'}})
        .end((err, res) => {
          if (err) reject(err);
          resolve(res);
        });
    });
    expect(res.body.data.podcastByIdentifier.name).to.be.equal('Espacio Binario');
    expect(res.body.data.podcastByIdentifier.identifier).to.be.equal('espacio-binario');
    expect(res.body.data.podcastByIdentifier.episodes.data.length).to.be.equal(NUMBER_OF_EPISODES);
  }
});
