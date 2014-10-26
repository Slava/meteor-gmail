var INIT_POLL_INTERVAL = 1000; // start with 1 second
var MAX_POLL_INTERVAL = 5 * 60 * 1000; // 5m

GMail.Poller = function (client, startHistoryId, cb) {
  if (typeof startHistoryId === 'function') {
    cb = startHistoryId;
    startHistoryId = undefined;
  }

  check(client, GMail.Client);
  check(startHistoryId, Match.Optional(String));
  check(cb, Function);

  this.client = client;
  this.startHistoryId = startHistoryId;
  this.callback = cb;
  this.pollInterval = INIT_POLL_INTERVAL;
  this.nextPollId = 0;
  this.alive = true;

  this.startPolling();
};

// returns true if something new has happened in this poll
GMail.Poller.prototype.performPoll = function () {
  var self = this;

  // Abort now!
  if (! self.alive)
    return false;

  var history = [];
  try {
    if (! self.startHistoryId || self.startHistoryId === '0')
      throw new Error('no startHistoryId');
    self.client.history(self.startHistoryId);
  } catch (err) {
    if (err.message.match(/404/) || err.message.match(/no startHistoryId/)) {
      // The last entry was so old or we never had an initial entry to start
      // with, we better start from the most recent
      var someMessages = self.client.list("", { maxResults: 1, limit: 1 });
      self.startHistoryId =
        self.client.get(someMessages[someMessages.length - 1].id).historyId;
    } else if (err.message.match(/502/)) {
      // Server refused to reply to us, retry later
      // return true to indicate that we want to retry sooner
      return true;
    } else {
      throw err;
    }
  }

  // use _.every to be able to break out of the loop
  _.every(history, function (historyItem) {
    var id = historyItem.id;
    _.each(historyItem.messages, function (messageItem) {
      self.callback(messageItem, id);
    });

    self.startHistoryId = id;

    // break if another fiber told us to stop
    return self.alive;
  });

  // Poll again later if still alive
  if (self.alive)
    Meteor.setTimeout(_.bind(self.performPoll, self), self.pollInterval);

  // Did we process at least one history item?
  return !! history.length;
};

GMail.Poller.prototype.startPolling = function () {
  this.alive = true;
  this.pollInterval = Math.floor(this.pollInterval / 2);
  var firstPoll = this.performPoll();

  if (firstPoll)
    this.pollInterval = INIT_POLL_INTERVAL;
  else {
    // if it fell beyond the threshold put it to init value
    // grow the interval slowly in the beginning
    // but then grow it faster if anything happens for a while
    if (this.pollInterval < INIT_POLL_INTERVAL)
      this.pollInterval = INIT_POLL_INTERVAL;
    else if (this.pollInterval < 60 * INIT_POLL_INTERVAL)
      this.pollInterval += INIT_POLL_INTERVAL;
    else
      this.pollInterval += 60 * INIT_POLL_INTERVAL;

    this.pollInterval = Math.min(this.pollInterval, MAX_POLL_INTERVAL);
  }
};

GMail.Poller.prototype.stopPolling = function () {
  this.alive = false;
  if (this.nextPollId) {
    Meteor.clearTimeout(this.nextPollId);
    this.nextPollId = 0;
  }
};

