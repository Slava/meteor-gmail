Package.describe({
  summary: "Simplest GMail API with real-time observation.",
  version: "0.1.0",
  git: "https://github.com/slava/meteor-gmail",
  name: "slava:gmail"
});

Package.onUse(function(api) {
  api.versionsFrom('METEOR@0.9.3');
  api.use(['underscore', 'http'], 'server');
  api.use('slava:gmail-query-parser@1.1.0', 'server');
  api.use(['facts'], 'server', {weak: true});
  api.addFiles([
    'gmail.js',
    'poller.js',
    'listener.js',
    'message.js',
    'decoders.js'], 'server');

  api.export('GMail');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('slava:gmail');
});
