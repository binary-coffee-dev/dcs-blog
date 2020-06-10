'use strict';

const {buildQuery, convertRestQueryParams} = require('strapi-utils');

/**
 * Read the documentation () to implement custom controller functions
 */

module.exports = {
  async find(ctx) {
    const publicOnly = (ctx.params._where && ctx.params._where.enable) ||
      (ctx.params.where && ctx.params.where.enable) || false;
    const limit = parseInt(ctx.query.limit || ctx.query._limit || Number.MAX_SAFE_INTEGER);
    const start = parseInt(ctx.query.start || ctx.query._start || Number.MIN_SAFE_INTEGER);

    return strapi.services.post.find(ctx, publicOnly, limit, start);
  },

  async count(ctx) {
    const publicOnly = (ctx.params._where && ctx.params._where.enable) ||
      (ctx.params.where && ctx.params.where.enable) || false;

    return strapi.services.post.count(ctx, publicOnly);
  },

  async findOneByName(ctx, next, extra = {}) {
    const name = ctx.params.name || ctx.params._name || '';
    const params = {name};
    const filters = convertRestQueryParams(params);
    return buildQuery({
      model: strapi.models.post,
      filters,
      populate: extra.populate || ''
    }).then(async (posts) => {
      let ret = null;
      if (posts && posts.length > 0) {
        const post = posts[0];
        const isPublished = Boolean(post.publishedAt && post.publishedAt.getTime() < new Date().getTime());
        const isEnable = !!post.enable;
        if (strapi.services.post.isAuthenticated(ctx) &&
          ((isPublished && isEnable) || (post.author && post.author._id.toString() === ctx.state.user.id.toString()))
        ) {
          ret = post;
        } else if (strapi.services.post.isStaff(ctx) || strapi.services.post.isAdmin(ctx)) {
          ret = post;
        } else if (isPublished && isEnable) {
          // public user
          ret = post;
        }
      }
      if (!ret) {
        ctx.status = 403;
        return {};
      }
      await strapi.services.post.updateViews(ret);
      return ret;
    });
  },

  async findSimilarPosts(ctx) {
    let {id, limit = 10} = ctx.params;
    limit = Math.max(Math.min(limit, 20), 0);

    let postToReturn = [];
    const post = await strapi.models.post.findOne({_id: id}).populate(['tags']);
    const tags = post.tags || [];
    const markTags = new Set();

    tags.forEach(tag => markTags.add(tag.id));

    const posts = (await strapi.models.post
      .find({publishedAt: {$lte: new Date()}, enable: true, _id: {$ne: id}})
      .sort({views: 'desc'})
      .populate(['tags'])) || [];

    posts
      .filter(post => (post.tags || []).reduce((p, v) => p || markTags.has(v.id), false))
      .forEach(post => {
        postToReturn.push(post);
      });

    if (postToReturn.length > limit) {
      postToReturn = postToReturn.slice(0, limit);
    }

    ctx.send(postToReturn);
  },

  async feedByUsername(ctx) {
    const {format, username} = ctx.params;
    return strapi.services.post.getFeedByUsername(ctx, username, format);
  },

  async feed(ctx) {
    const {format} = ctx.params;
    return strapi.services.post.getFeed(ctx, format);
  }
};
