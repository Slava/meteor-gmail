Example app for GMail package
===

Create a new Google Application, set the JS Origin as `http://localhost:3000`
and callback URI as `http://localhost:3000/_oauth/google`.

Also add the GMail API to the list of APIs.

Set up the Google Accounts configuration:

    ServiceConfiguration.configurations.insert({service:"google", "clientId" : <ClientID>, "secret" : <YourSecret>, "loginStyle" : "popup"})

Login with your Google account on the front-page.

All messages matching "google i/o" will be printed to the server console.



