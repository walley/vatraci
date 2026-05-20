const API_BASE = "https://fada.hasici-ol.cz/fad-be/v1/api";
const FE_BASE = "https://fadc.hasici-ol.cz/fad-be/v1/api";

export default {
  base: API_BASE,
  auth: {
    login: `${API_BASE}/auth/login`,
  },

  api_url: "https://fada.hasici-ol.cz/fad-be/v1",
  frontendBaseUrl: 'https://fadc.hasici-ol.cz/fad-fe/v3/',

  path: {
    prefix: "api",
    storage: "storage",
    upload: "files/file-upload",
  },
};
