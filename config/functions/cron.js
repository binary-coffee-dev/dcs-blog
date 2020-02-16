'use strict';

const deliveryToEmailSubscriptions = require('./delivery.to.email.subscriptions');

/**
 * Cron config that gives you an opportunity
 * to run scheduled jobs.
 *
 * The cron format consists of:
 * [MINUTE] [HOUR] [DAY OF MONTH] [MONTH OF YEAR] [DAY OF WEEK] [YEAR (optional)]
 */
module.exports = {
  '* * * * *': async () => {
    await deliveryToEmailSubscriptions.send('Binary Coffee Weekly Posts', 7);
  }
};
