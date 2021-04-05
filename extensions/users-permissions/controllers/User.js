'use strict';

const User = require('strapi-plugin-users-permissions/controllers/User');

// toDo 04.04.21: in the future, add this method to the service file
const getUsersById = async (userIds) => {
  const users = await strapi.plugins['users-permissions'].models.user.find({
    _id: {
      $in: userIds.filter(v => v._id).map(v => v._id)
    }
  });
  const positions = new Map();
  userIds.forEach((u, i) => positions.set(u._id.toString(), i));
  users.sort((u1, u2) => positions.get(u1._id.toString()) > positions.get(u2._id.toString()));
  return users;
}

const UserNew = {
  ...User,
  async me(ctx) {
    await User.me(ctx);
    if (!ctx.body.avatar) {
      const FIRST_PROVIDER = 0;
      const providerId = ctx.state.user.providers[FIRST_PROVIDER];
      const provider = await strapi.services.provider.findOne({id: providerId});
      ctx.body.avatar = {
        url: provider.avatar
      };
    }
  },

  async update(ctx) {
    await User.update(ctx);
    const user = await strapi.plugins['users-permissions'].models.user.findOne({_id: ctx.params.id});
    if (user.avatar) {
      user.avatarUrl = user.avatar.url;
      await user.save();
    }
    ctx.send(user);
  },

  async topPopularUsers(ctx) {
    const topUsersIds = await strapi.models.post.aggregate([
      {
        "$group": {
          "_id": '$author',
          "viewsCount": {"$sum": "$likes"}
        }
      },
      {"$sort": {"viewsCount": -1}},
      {"$limit": 5}
    ]);
    const users = await getUsersById(topUsersIds);
    ctx.send(users);
  },

  async topActiveUsers(ctx) {
    const topUsersIds = await strapi.models.post.aggregate([
      {
        "$group": {
          "_id": '$author',
          "postCount": {"$sum": 1}
        }
      },
      {"$sort": {"postCount": -1}},
      {"$limit": 100}
    ]);
    const users = await getUsersById(topUsersIds);
    ctx.send(users);
  }
};

module.exports = UserNew;
