module.exports = {
  query: 'findRandomAds(country: String!, limit: Int): [Ad]',
  resolver: {
    Query: {
      findRandomAds: {
        resolver: 'application::ad.ad.findRandom'
      }
    }
  }
};
