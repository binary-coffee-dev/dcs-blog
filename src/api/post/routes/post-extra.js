module.exports = {
  routes: [
    {
      method: "GET",
      path: "/post-body-by-name/:name/download.md",
      handler: "post.getPostBodyByName",
    },
    {
      method: "GET",
      path: "/posts/feed/:username/:format",
      handler: "post.feedByUsername",
    },
    {
      method: "GET",
      path: "/posts/feed/:format",
      handler: "post.feed",
    },
    {
      method: "GET",
      path: "/sitemap",
      handler: "post.sitemap"
    }
  ]
}
