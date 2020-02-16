'use strict';

const _ = require('lodash');
const ejs = require('ejs');

async function getPostsOfLastDays(days) {
  var date = new Date();
  date.setDate(date.getDate() - days);
  return await strapi.query("post").find({
    publishedAt_gt: date
  }); 
}

async function getVerifiedSubscribers() {
  return await strapi
    .services
    .subscription
    .find({verified: true});
}

async function getHtmlWithPosts(posts) {
  const data = {
    posts: posts
  };
  const options = {
  };

  return await new Promise((resolve, reject) => {
    ejs.renderFile(
      './config/functions/posts-for-subscriptions-template.html',
      data,
      options,
      function(err, str){
        if (err)
          reject(err);
        else
          resolve(str);
      });
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
    console.log(mail);
    await strapi.plugins['email'].services.email.send(mail);
  });
}

module.exports = {
  send: async (subject, previousDays) => {
    const posts = await getPostsOfLastDays(previousDays);
    if (posts.length === 0)
      return;
    const html = await getHtmlWithPosts(posts);
    const verifySubscribers = await getVerifiedSubscribers();
    sendEmails(verifySubscribers, subject, html);
  }
};
  