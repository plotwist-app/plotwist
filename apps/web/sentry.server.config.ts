// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: 'https://c7e69b53b88a69fa60b59356538e88a9@o4507996828925952.ingest.us.sentry.io/4507996829908992',

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
})
