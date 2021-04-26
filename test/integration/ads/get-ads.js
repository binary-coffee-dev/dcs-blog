const chai = require('chai');
const chaiHttp = require('chai-http');

chai.use(chaiHttp);
const expect = chai.expect;

const QUERY_GET_ADS = {
  operationName: null,
  // language=GraphQL
  query: 'query ($country: String){\n  ads(where: { country:  $country }){\n    id\n    _id\n    createdAt\n    updatedAt\n    country\n    code\n  }\n}'
};

const QUERY_GET_RANDOM_ADS = {
  operationName: null,
  // language=GraphQL
  query: 'query ($country: String!){\n  findRandomAds( country:  $country ){\n    id\n    _id\n    createdAt\n    updatedAt\n    country\n    code\n  }\n}'
};

describe('get ads INTEGRATION', () => {

  beforeEach(() => {
    for (let i = 0; i < 10; i++) {
      strapi.models.ad.create({code: '' + i, country: 'ES'});
    }
  });

  it('should get the filtered list of ads', async () => {
    const res = await new Promise((resolve, reject) => {
      chai.request(strapi.server)
        .post('/graphql')
        .send({...QUERY_GET_ADS, variables: {country: 'ES'}})
        .end((err, res) => err ? reject(err) : resolve(res));
    });

    expect(res.body.data.ads.length).to.be.equal(10);
  });

  it('should get random ads', async () => {
    const res = await new Promise((resolve, reject) => {
      chai.request(strapi.server)
        .post('/graphql')
        .send({...QUERY_GET_RANDOM_ADS, variables: {country: 'ES'}})
        .end((err, res) => err ? reject(err) : resolve(res));
    });

    expect(res.body.data.findRandomAds.length).to.be.equal(6);
  });
});
