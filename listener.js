GMail.Listener = function (client, query, startHistoryId, cb) {
  this.client = client;
  this.query = query;
  this.matcher = new GMailQuery.Matcher(query);
  this.startHistoryId = startHistoryId || 0;
  this.callback = cb;

  this.fetchInitBatch();
};

GMail.Listener.prototype.fetchInitBatch = function () {
  var self = this;
  var messages = self.client.list(self.query);
  _.each(messages, _.bind(self.handleNewMessage, self));

  if (! self.startHistoryId && messages.length)
    self.startHistoryId = messages[messages.length - 1].historyId;
};

GMail.Listener.prototype.handleNewMessage = function (doc, historyId) {
  var self = this;
  if (historyId <= self.startHistoryId)
    return;

  var message = new GMail.Message(doc);
  if (! self.matcher.matches(doc)) return;

  self.callback(message, historyId, doc);
};

