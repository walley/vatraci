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

// -----------------------------------------------------
// 1. RESTORE AUTH BEFORE APP CREATION
// -----------------------------------------------------
store.dispatch("auth/restoreAuth").then(() => {

  // -----------------------------------------------------
  // 2. SETUP INTERCEPTOR (vue-resource)
  // -----------------------------------------------------
  Vue.http.interceptors.push((request, next) => {
    const token = store.state.auth?.token || localStorage.getItem("token");

    if (token) {
      request.headers.set("Authorization", "Bearer " + token);
      request.headers.set("X-Access-Token", token);
    }

    request.headers.set("X-Client-Version", "v3");

    next((response) => {
      if (response.status === 401 || response.status === 403) {

        // Prevent infinite loops
        if (router.currentRoute.path !== "/login") {
          store.dispatch("auth/logout");

          router.push({
            path: "/login",
            query: { redirect: router.currentRoute.fullPath }
          }).catch(() => {});
        }
      }
    });
  });

  // -----------------------------------------------------
  // 3. CREATE APP ONLY AFTER AUTH IS RESTORED
  // -----------------------------------------------------
  new Vue({
    router,
    store,
    vuetify,
    render: (h) => h(App),
  }).$mount("#app");

});
