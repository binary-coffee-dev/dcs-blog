module.exports = {
  query: `
    podcastByIdentifier(identifier: String!): Podcast!
  `,
  resolver: {
    Query: {
      podcastByIdentifier: {
        resolver: 'application::podcast.podcast.podcastByIdentifier'
      }
    }
  }
};
