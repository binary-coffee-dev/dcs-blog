module.exports = {
  '0 18 * * 5': async (/*{strapi}*/) => {
    // Every Friday at 6pm
    // await deliveryToEmailSubscriptions.send('Binary Coffee Weekly Posts', 7);
    console.log('send weekly email');
  }
};
