import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import vuetify from "./plugins/vuetify";
import "./plugins/http";
import VueLoading from "vue-loading-overlay";
import "vue-loading-overlay/dist/vue-loading.css";
import "@/mixins/helperMixin";

Vue.config.productionTip = false;
Vue.use(VueLoading);

// 1) Global vue-resource interceptor (always active)
let pendingRequests = 0;
Vue.http.interceptors.push((request, next) => {
  pendingRequests += 1;
  store.state.loading = true;

  const token = store.state.auth?.token || localStorage.getItem("token");

  if (token) {
    request.headers.set("Authorization", "Bearer " + token);
    request.headers.set("X-Access-Token", token);
  }

  request.headers.set("X-Client-Version", "v3");

  next((response) => {
    pendingRequests = Math.max(0, pendingRequests - 1);
    if (pendingRequests === 0) store.state.loading = false;
    if (response.status === 401 || response.status === 403) {
      if (
        router.currentRoute.path !== "/login" &&
        !store.state.auth.isFrontendAdmin
      ) {
        store.dispatch("auth/logout");
        router
          .push({
            path: "/login",
            query: { redirect: router.currentRoute.fullPath },
          })
          .catch(() => {});
      }
    }
  });
});

// 2) Restore auth, then mount app
store.dispatch("auth/restoreAuth").then(() => {
  new Vue({
    router,
    store,
    vuetify,
    render: (h) => h(App),
  }).$mount("#app");
});
