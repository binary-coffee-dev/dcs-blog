const chai = require('chai');
const chaiHttp = require('chai-http');

const createUser = require('../../helpers/create-user');
const deleteUser = require('../../helpers/delete-user');
const createEpisode = require('../../helpers/create-episode');
const deleteEpisode = require('../../helpers/delete-episode');
const generateJwt = require('../../helpers/generate-jwt-by-user');

chai.use(chaiHttp);

const expect = chai.expect;

const QUERY_GET_PODCAST_BY_IDENTIFIER = {
  variables: {},
  // language=JavaScript
  query: 'query ($identifier: String!) {\n  podcastByIdentifier(identifier: $identifier) {\n    name\n    identifier\n    episodes {\n      id\n      title\n      url\n      description\n      banner\n      date\n      duration\n    }\n  }\n}'
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

    const podcastIns = await strapi.query('podcast').findOne({identifier: 'espacio-binario'});
    for (let i = 0; i < NUMBER_OF_EPISODES; i++) {
      await createEpisode(strapi, podcastIns);
    }
  });

  after(async () => {
    await deleteUser(strapi, authUser);
    await deleteUser(strapi, staffUser);
    await deleteUser(strapi, adminUser);

    const episodes = await strapi.models.episode.find();
    for (let e of episodes) {
      await deleteEpisode(strapi, e);
    }
  });

  it('should get the podcast and the list of episodes (public user)', async () => {
    console.log()
    await astestRequestPodcast();
  });

  it('should get the podcast and the list of episodes (auth user)', async () => {
    const jwt = generateJwt(strapi, authUser);
    await astestRequestPodcast(jwt);
  });

  it('should get the podcast and the list of episodes (staff user)', async () => {
    const jwt = generateJwt(strapi, staffUser);
    await astestRequestPodcast(jwt);
  });

  it('should get the podcast and the list of episodes (admin user)', async () => {
    const jwt = generateJwt(strapi, adminUser);
    await astestRequestPodcast(jwt);
  });

  async function astestRequestPodcast(jwt) {
    console.log();
    const res = await new Promise((resolve, reject) => {
      const req = chai.request(strapi.server).post('/graphql');
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
    expect(res.body.data.podcastByIdentifier.episodes.length).to.be.equal(NUMBER_OF_EPISODES);
  }
});
