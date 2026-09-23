const fs = require('fs');
const jsdom = require('/tmp/test-jsdom/node_modules/jsdom');
const { JSDOM } = jsdom;
const html = fs.readFileSync('dist/index.html', 'utf8');
const dom = new JSDOM(html, { runScripts: "dangerously", resources: "usable" });
dom.window.addEventListener('error', (event) => {
  console.log('Script Error:', event.error ? (event.error.stack || event.error) : event.message);
});
setTimeout(() => console.log('Done'), 3000);
