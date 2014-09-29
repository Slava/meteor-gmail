if (Meteor.isServer) {
  var gmailClients = {};
  Meteor.users.find().observe({
    added: function (doc) {
      var googleConf =
        ServiceConfiguration.configurations.findOne({service: 'google'});

      var google = doc.services.google;

      gmailClients[doc._id] = new GMail.Client({
        clientId: googleConf.clientId,
        clientSecret: googleConf.clientSecret,
        accessToken: google.accessToken,
        expirationDate: google.expiresAt,
        refreshToken: google.refreshToken
      });

      gmailClients[doc._id].onNewEmail('"google i/o"', function (message) {
        console.log(message.snippet);
      });
    }
  });
} else {
  Template.body.events({
    'click button': function () {
      Meteor.loginWithGoogle({
        requestOfflineToken: true,
        forceApprovalPrompt: true,
        requestPermissions: ["https://www.googleapis.com/auth/gmail.readonly"]
      });
    }
  });

  Template.body.helpers({
    haveConf: function () {
      return !!ServiceConfiguration.configurations.findOne({service: 'google'});
    }
  });
}

