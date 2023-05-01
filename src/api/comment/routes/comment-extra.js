module.exports = {
  routes: [
    {
      method: "GET",
      path: "/recentComments",
      handler: "comment.recentComments",
    }
  ]
}
