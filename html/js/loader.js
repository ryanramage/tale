var plugins = {
  markdown: require('tale-plugin-markdown')({})
}

var tale = require('tale-browser')({
  base_url: './build',
  plugins: plugins
})
