const API_BASE = "https://fadc.hasici-ol.cz/fad-be/v1/api";

export default {
  base: API_BASE,

  auth: {
    login: `${API_BASE}/auth/login`,
  },

  url: "https://fada.hasici-ol.cz/fad-be/v1",

  // Frontend base URL - where to redirect after logout
  frontendBaseUrl: 'https://fadc.hasici-ol.cz/fad-fe/v3/',

  path: {
    prefix: "api",
    storage: "storage",
    upload: "files/file-upload",
  },
};
