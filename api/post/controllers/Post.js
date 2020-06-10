'use strict';

const {buildQuery, convertRestQueryParams} = require('strapi-utils');

/**
 * Read the documentation () to implement custom controller functions
 */

const MAX_POST_LIMIT = 20;
const MIN_POST_START = 0;
const SORT_ATTR_NAME = 0;
const SORT_ATTR_VALUE = 1;

const createQueryObject = (ctx, publicOnly) => {
  if (strapi.services.post.isAuthenticated(ctx) && !publicOnly) {
    return {$or: [{publishedAt: {$lte: new Date()}, enable: true}, {author: ctx.state.user.id}]};
  } else if ((!strapi.services.post.isAdmin(ctx) && !strapi.services.post.isStaff(ctx)) || publicOnly) {
    // public user
    return {publishedAt: {$lte: new Date()}, enable: true};
  }
  return {};
};

module.exports = {
  async find(ctx = {}) {
    const publicOnly = (ctx.params._where && ctx.params._where.enable) ||
      (ctx.params.where && ctx.params.where.enable) || false;

    let sort = {};
    const sortFromRequest = (ctx.query.sort || ctx.query._sort);
    const sortQuery = sortFromRequest && sortFromRequest.split(':');
    if (sortQuery && sortQuery.length === 2) {
      sort[sortQuery[SORT_ATTR_NAME]] = sortQuery[SORT_ATTR_VALUE].toLowerCase() === 'asc' ? 1 : -1;
    }

    const query = createQueryObject(ctx, publicOnly);
    return await strapi.models.post.find(query)
      .limit(Math.min(ctx.query.limit || ctx.query._limit || MAX_POST_LIMIT, MAX_POST_LIMIT))
      .skip(Math.max(ctx.query.start || ctx.query._start || MIN_POST_START, MIN_POST_START))
      .sort(sort);
  },

  async count(ctx) {
    const publicOnly = (ctx.params._where && ctx.params._where.enable) ||
      (ctx.params.where && ctx.params.where.enable) || false;

    const query = createQueryObject(ctx, publicOnly);
    return await strapi.models.post.count(query);
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
