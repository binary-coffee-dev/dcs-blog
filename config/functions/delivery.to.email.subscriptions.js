'use strict';

const _ = require('lodash');
const ejs = require('ejs');
const minify = require('html-minifier').minify;
const marked = require('marked');

function cleanBody(body) {
  return body.replace( /(<([^>]+)>)/ig, '')
    .replace(/\r?\n|\r/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function getPublicPostsOfLastDays(previousDays) {
  const posts = await strapi
    .services
    .post
    .getPublicPostsOfLastDays(previousDays);
  return posts.map(post => ({...post, body: cleanBody(marked(post.body))}));
}

async function getVerifiedAndEnableSubscribers() {
  return await strapi
    .services
    .subscription
    .find({
      verified: true,
      enable: true
    });
}

async function getHtmlWithPosts(posts) {
  const data = {
    posts: posts,
    siteUrl: strapi.config.custom.siteUrl
  };
  const options = {};

  return await new Promise((resolve, reject) => {
    ejs.renderFile(
      './public/posts-for-subscriptions-template.html',
      data,
      options,
      function (err, str) {
        if (err)
          reject(err);
        else
          resolve(str);
      });
  });
}

function minifyHtml(html) {
  return minify(
    html,
    {
      collapseWhitespace: true,
      removeComments: true,
      removeTagWhitespace: true
    });
}

function sendEmails(verifySubscribers, subject, html) {
  const BCC_COUNT = 50;
  const SUBSCRIBER_RECIPIENT = 'subscribers@binary-coffee.dev';
  const chunks = _.chunk(verifySubscribers, BCC_COUNT);
  chunks.forEach(async chunk => {
    const bcc = chunk.map(subscriber => subscriber.email).join();
    const mail = {
      to: SUBSCRIBER_RECIPIENT,
      bcc: bcc,
      subject: subject,
      html: html
    };
    await strapi.plugins['email'].services.email.send(mail);
  });
}

module.exports = {
  send: async (subject, previousDays) => {
    const posts = await getPublicPostsOfLastDays(previousDays);
    if (posts.length === 0)
      return;
    let html = await getHtmlWithPosts(posts);
    html = minifyHtml(html);
    const verifySubscribers = await getVerifiedAndEnableSubscribers();
    sendEmails(verifySubscribers, subject, html);
  },

  cleanBody
};
