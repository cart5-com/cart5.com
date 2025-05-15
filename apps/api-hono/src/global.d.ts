declare global {
  var globalSentry: import("@sentry/node").NodeClient | undefined;
  var SENTRY_RELEASE: {
    id: string;
  };
}

export { };