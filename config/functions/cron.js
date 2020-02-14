'use strict';

const _ = require('lodash');

async function getPostsOfLast7Days() {
  var date = new Date();
  date.setDate(date.getDate() - 7);
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

async function getHtmlWithPostsOfTheWeek(posts) {
  // TODO: use template
  var html = '';
  posts.forEach(post => {
    html += '<p>' + post.title + '</p>'; 
  });
  return html;
}

function sendEmails(verifySubscribers, subject, html) {
  const BCC_COUNT = 50;
  const chunks = _.chunk(verifySubscribers, BCC_COUNT);
  chunks.forEach(async chunk => {
    const to = chunk.map(subscriber => subscriber.email).join();
    const mail = {
      bcc: to,
      subject: subject,
      html: html
    };
    await strapi.plugins['email'].services.email.send(mail);
  });
}

/**
 * Cron config that gives you an opportunity
 * to run scheduled jobs.
 *
 * The cron format consists of:
 * [MINUTE] [HOUR] [DAY OF MONTH] [MONTH OF YEAR] [DAY OF WEEK] [YEAR (optional)]
 */
module.exports = {
  '0 0 * * 6': async () => {
    const posts = await getPostsOfLast7Days();
    if (posts.length === 0)
      return;
    const html = await getHtmlWithPostsOfTheWeek(posts);
    const verifySubscribers = await getVerifiedSubscribers();
    const subject = 'Binary Coffee Weekly Posts';
    sendEmails(verifySubscribers, subject, html);
  }
};
