GMail.Listener = function (client, query, startHistoryId, cb) {
  this.client = client;
  this.query = query;
  this.matcher = new GMailQuery.Matcher(query);
  this.startHistoryId = startHistoryId || null;
  this.callback = cb;

  this.fetchInitBatch();
};

GMail.Listener.prototype.fetchInitBatch = function () {
  var self = this;
  var messages = self.client.list(self.query);
  messages.reverse();
  _.each(messages, function (message) {
    self.handleNewMessage(message, message.historyId);
  });

  if (! self.startHistoryId && messages.length)
    self.startHistoryId = messages[messages.length - 1].historyId;
};

GMail.Listener.prototype.handleNewMessage = function (doc, historyId) {
  var self = this;
  if (historyId && historyId <= self.startHistoryId)
    return;

  var message = new GMail.Message(doc);
  if (! self.matcher.matches(message)) return;

  self.callback(message, historyId, doc);
};

