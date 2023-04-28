module.exports = (service) => {
  service.topActiveUsers = async function() {
    const limit = strapi.config.custom.maxNumberOfTopUsers;
    const usersQuery = await strapi.connections.default
      .raw('SELECT u.id, (SELECT COUNT(id) FROM post WHERE author=u.id AND enable=1 AND published_at<=?) AS counter FROM `users-permissions_user` AS u ORDER BY counter DESC limit ?;',
        [new Date(), limit]);
    if (process.env.NODE_ENV === 'test') {
      return this.getTopUserFormatted(usersQuery);
    } else {
      return this.getTopUserFormatted(usersQuery[0]);
    }
  };

  service.topPopularUsers = async function() {
    const limit = strapi.config.custom.maxNumberOfTopUsers;
    const usersQuery = await strapi.connections.default
      .raw('SELECT u.id, (SELECT SUM(likes) FROM post WHERE author=u.id AND enable=1 AND published_at<=?) AS counter FROM `users-permissions_user` AS u ORDER BY counter DESC limit ?;',
        [new Date(), limit]);
    if (process.env.NODE_ENV === 'test') {
      return this.getTopUserFormatted(usersQuery);
    } else {
      return this.getTopUserFormatted(usersQuery[0]);
    }
  };

  service.getTopUserFormatted = async function(usersQuery) {
    let users = await strapi.query('plugin::users-permissions.user').find({
      id_in: usersQuery.map(u => u.id)
    });
    const ma = usersQuery.reduce((p, v) => {
      p.set(v.id, +v.counter);
      return p;
    }, new Map());
    users = users.sort((a, b) => ma.get(b.id) - ma.get(a.id));
    const values = usersQuery.map(v => +v.counter);
    return {users, values};
  };
};
