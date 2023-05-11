async function request(strapi, chai, {filePath, fileName}, jwt) {
  return await new Promise((resolve, reject) => chai.request(strapi.server.httpServer)
    .post('/api/upload')
    .set('Authorization', `Bearer ${jwt}`)
    .set('Content-Type', 'image/png')
    .attach('files', filePath, fileName)
    .end((err, res) => err ? reject(err) : resolve(res)));
}

module.exports = async function uploadImageRequest(strapi, chai, variables, jwt) {
  return await request(strapi, chai, variables, jwt);
};

module.exports.request = request;
