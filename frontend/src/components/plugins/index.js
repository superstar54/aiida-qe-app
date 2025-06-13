const requirePlugin = require.context('.', true, /index\.js$/);
const plugins = [];

requirePlugin.keys().forEach((fileName) => {
  if (fileName === './index.js') return; // Skip the index file itself
  const plugin = requirePlugin(fileName).default;
  plugins.push(plugin);
});

export default plugins;
