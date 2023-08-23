module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/subscribe',
      handler: 'subscription.subscribe',
      policies: ['global::disable']
    },
    {
      method: 'POST',
      path: '/verify',
      handler: 'subscription.verify',
      policies: ['global::disable']
    },
    {
      method: 'POST',
      path: '/unsubscribe',
      handler: 'subscription.unsubscribe',
      policies: ['global::disable']
    },
  ]
};
