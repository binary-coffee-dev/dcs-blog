module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/subscribe',
      handler: 'subscription.subscribe'
    },
    {
      method: 'POST',
      path: '/verify',
      handler: 'subscription.verify'
    },
    {
      method: 'POST',
      path: '/unsubscribe',
      handler: 'subscription.unsubscribe'
    },
  ]
};
