module.exports = {
  resolver: {
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
