'use strict';

const ejs = require('ejs');
const minify = require('html-minifier').minify;
const marked = require('marked');

function cleanBody(body) {
  return body.replace(/(<([^>]+)>)/ig, '')
    .replace(/\r?\n|\r/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function getPublicPostsOfLastDays(previousDays) {
  const posts = await strapi.service('api::post.post').getPublicPostsOfLastDays(previousDays);
  return posts.map(post => ({...post, body: cleanBody(marked.parse(post.body))}));
}

async function getSuggestionArticles(previousDays) {
  const posts = await strapi.service('api::post.post').getRandomArticles(previousDays, 5);
  return posts.map(post => ({...post, body: cleanBody(marked.parse(post.body))}));
}

async function getVerifiedAndEnableSubscribers() {
  return await strapi.query('api::subscription.subscription').findMany({where: {verified: true, enable: true}});
}

async function getHtmlWithPosts(posts, postsSuggestions, unsubscribeToken) {
  const data = {
    posts,
    postsSuggestions,
    siteUrl: strapi.config.custom.siteUrl,
    unsubscribeToken,
    year: new Date().getFullYear()
  };
  const options = {};

  return await new Promise((resolve, reject) => {
    ejs.renderFile(
      './public/posts-for-subscriptions-template.html',
      data,
      options,
      (err, str) => err ? reject(err) : resolve(str));
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


const subscriptionsEmails = {
  sendEmailWithLatestPosts: async (subject, previousDays) => {
    const posts = await getPublicPostsOfLastDays(previousDays);
    if (posts.length === 0)
      return;

    const postsSuggestions = await getSuggestionArticles(previousDays);

    const verifySubscribers = await getVerifiedAndEnableSubscribers();
    for (const subscriber of verifySubscribers) {
      let html = await getHtmlWithPosts(posts, postsSuggestions, subscriber.unsubscribeToken);
      html = minifyHtml(html);

      // toDo (gonzalezext)[28.08.23]: remove this
      require('fs').writeFileSync('./xxxxxxxx.html', html);

      await subscriptionsEmails.sendEmails([subscriber], subject, html);
    }
  },

  sendEmails: async (verifiedSubscribers, subject, html) => {
    const emails = verifiedSubscribers.map(s => s.email);
    for (const to of emails) {
      await strapi.plugins['email'].services.email.send({
        to,
        subject,
        html
      });
    }
  },

  cleanBody
};

module.exports = subscriptionsEmails;
