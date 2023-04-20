module.exports = {
  async topActiveUsers() {
    const limit = strapi.config.custom.maxNumberOfTopUsers;
    const usersQuery = await strapi.connections.default
      .raw('SELECT u.id, (SELECT COUNT(id) FROM post WHERE author=u.id AND enable=1 AND published_at<=?) AS counter FROM `users-permissions_user` AS u ORDER BY counter DESC limit ?;',
        [new Date(), limit]);
    return this.getTopUserFormatted(usersQuery);
  },

  async topPopularUsers() {
    const limit = strapi.config.custom.maxNumberOfTopUsers;
    const usersQuery = await strapi.connections.default
      .raw('SELECT u.id, (SELECT likes FROM post WHERE author=u.id AND enable=1 AND published_at<=?) AS counter FROM `users-permissions_user` AS u ORDER BY counter DESC limit ?;',
        [new Date(), limit]);
    return this.getTopUserFormatted(usersQuery);
  },

  async getTopUserFormatted(usersQuery) {
    let users = await strapi.query('user', 'users-permissions').find({
      id_in: usersQuery.map(u => u.id)
    });
    const ma = usersQuery.reduce((p, v) => {
      p.set(v.id, v.counter);
      return p;
    }, new Map());
    users = users.sort((a, b) => ma.get(b.id) - ma.get(a.id));
    const values = usersQuery.map(v => v.counter);
    return {users, values};
  }
};
