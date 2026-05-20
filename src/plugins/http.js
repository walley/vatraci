import Vue from "vue";
import vueResource from "vue-resource";
import config from "@/config/config";

Vue.use(vueResource);

const prefix = config.path.prefix ? `/${config.path.prefix}` : "";

Vue.http.options.root = `${config.api_url}${prefix}`;
Vue.http.options.emulateJSON = true;
