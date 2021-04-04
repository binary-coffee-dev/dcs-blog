'use strict';

const User = require('strapi-plugin-users-permissions/controllers/User');

// toDo 04.04.21: in the future, add this method to the service file
const getUsersById = async (userIds) => {
  return strapi.plugins['users-permissions'].models.user.find({
    _id: {
      $in: userIds.filter(v => v._id).map(v => v._id)
    }
  });
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
    const topUsersIds = await strapi.models.opinion.aggregate([
      {
        "$group": {
          "_id": '$user',
          "opinionCount": {"$sum": 1}
        }
      },
      {"$sort": {"opinionCount": -1}},
      {"$limit": 5}
    ]);
    ctx.send(getUsersById(topUsersIds));
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
      {"$limit": 5}
    ]);
    ctx.send(getUsersById(topUsersIds));
  }
};

module.exports = UserNew;
