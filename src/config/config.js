// === FIXED DEPLOYMENT PATHS - edit these to match your server ===
// No environment variables are used - change the URLs directly.
// The frontend is static files served by the httpd (nginx); these URLs
// are compiled into the bundle at build time.

// Global version of this frontend. Bump it on a version change - it is the
// single source of truth for the output directory (dist/<version>), the
// public path (/fad-fe/<version>/) and the frontend base URI below.
const VERSION = "v4";

// Backend API base URI (no trailing slash, no /api suffix)
const BACKEND_API_URI = "https://fada.hasici-ol.cz/fad-be/v1";

// Base URI of this frontend (trailing slash)
const FRONTEND_BASE_URI = `https://fadc.hasici-ol.cz/fad-fe/${VERSION}/`;

module.exports = {
  version: VERSION,

  base: `${BACKEND_API_URI}/api`,

  auth: {
    login: `${BACKEND_API_URI}/api/auth/login`,
  },

  api_url: BACKEND_API_URI,
  frontendBaseUrl: FRONTEND_BASE_URI,

  path: {
    prefix: "api",
    storage: "storage",
    upload: "files/file-upload",
  },
};
