module.exports = {
  definition: `
    type UploadFileSchema {
      values: [UploadFile]
      groupBy: UploadFileGroupBy
      aggregate: UploadFileAggregator
    }
  `,
  query: `
    uploadsConnection(sort: String, limit: Int, start: Int, where: JSON): UploadFileSchema
    countUploads: Int!
  `,
  resolver: {
    Query: {
      uploadsConnection: {
        resolver: 'plugins::upload.upload.findConnection'
      },
      countUploads: {
        resolver: 'plugins::upload.upload.count'
      }
    }
  }
};
