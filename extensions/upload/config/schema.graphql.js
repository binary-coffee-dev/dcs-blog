module.exports = {
  definition: `
    type UploadFileSchema {
      values: [UploadFile]
      groupBy: UploadFileGroupBy
      aggregate: UploadFileAggregator
    }
  `,
  query: 'uploadsConnection(sort: String, limit: Int, start: Int, where: JSON): UploadFileSchema',
  resolver: {
    Query: {
      uploadsConnection: {
        resolver: {
          plugin: 'upload',
          handler: 'Upload.findConnection'
        }
      }
    }
  }
};
