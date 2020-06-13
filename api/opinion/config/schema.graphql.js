module.exports = {
  query: `
    countOpinions(where: JSON): Int!
  `,
  resolver: {
    Query: {
      countOpinions: {
        resolver: 'application::opinion.opinion.count',
      }
    },
    Mutation: {
      createOpinion: {
        resolver: 'application::opinion.opinion.create',
        policies: [
          'canCreateOpinion'
        ]
      },
      deleteOpinion: {
        resolver: 'application::opinion.opinion.delete',
        policies: [
          'canRemoveOpinion'
        ]
      }
    }
  }
};
