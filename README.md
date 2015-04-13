GMail API package for Meteor
===

This is not a wrapper package!

`slava:gmail` package provides you with a simplified access to the [GMail
API](https://developers.google.com/gmail/api/), filtering and smart polling of
the new messages.

With one simple method you will get notified whenever there is a new email in
the user's inbox matching your query:

```javascript
var client = new GMail.Client({ ... });
client.onNewEmail('"tasty food" OR to:jobs@meteor.com', function (message) {
  console.log(message.snippet);
});
```


## Get started

Create a new Google Project at https://console.developers.google.com/. Be sure
to add the 'GMail API' at the APIs tab.

Create a client instance by passing these 5 credentials: `clientId`,
`clientSecret`, `accessToken`, `expirationDate`, `refreshToken`.

Note, you get the `clientId` and `clientSecret` from your Google Project
page. The `refreshToken` and `accessToken` as well as the `expirationDate` can
be obtained from a user object if you use `accounts-google` package.

To get the `refreshToken` you need to request "offline" support and enforce the
"approval form". Also you would need to put at least "gmail.readonly"
permissions on the requested scope.

Put it all together and here is an example login button:

```javascript
// on the client
Meteor.loginWithGoogle({
  requestOfflineToken: true,
  forceApprovalPrompt: true,
  requestPermissions: ["https://www.googleapis.com/auth/gmail.readonly"]
});

// on the server
var googleConf =
  ServiceConfiguration.configurations.findOne({service: 'google'});

var google = user.services.google;

var client = new GMail.Client({
  clientId: googleConf.clientId,
  clientSecret: googleConf.secret,
  accessToken: google.accessToken,
  expirationDate: google.expiresAt,
  refreshToken: google.refreshToken
});
```


## Features

Query the list of messages matching certain query:

```javascript
// print snippets of messages matching "query"
console.log(client.list("query").map(function (m) {
  return m.snippet;
}));
```

Get an individual message by id:

```javascript
console.log(client.get("13991912923").snippet);
```

Create a parsed Message object:

```javascript
var rawMessage = client.get("13991912923");
var parsedMessage = new GMail.Message(rawMessage);
console.log(parsedMessage.html);
```

Properties of parsed Messages: 
- _historyId
- _id
- _threadId
- bcc
- cc
- date
- from
- html
- snippet
- subject
- text
- to

Get all new messages for query starting from 1995:

```javascript
client.onNewEmail('query', function (message) {
  console.log(message.snippet);
});
```

... or all new messages from a certain history id (see GMail API for more info
about history ids):


```javascript
client.onNewEmail('query', startingHistoryId, function (message) {
  console.log(message.snippet);
});
```

## Polling

Polling is smart but still in development. The package will check for new mail
first time. If nothing is found it will retry in 1 second. If nothing is found
it will retry in 2 seconds, 3, 4, 5 and so on up to 60. Then it will retry in 2
minutes, 3, 4, 5 and so on. If something new is found, the timeout is back to 1
second.

This package is polling only for the History API and not for every query
individually. Such polling has smaller network footprint and doesn't require
any diffing of results on site (no extra memory stored).

## Contributions

They are welcome.

## License

The MIT License (MIT)
Copyright (c) 2014 Slava Kim

