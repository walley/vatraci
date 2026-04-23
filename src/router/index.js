import Vue from "vue";
import VueRouter from "vue-router";
import store from "../store";   // ← important
import Planner from "../views/planner/Planner.vue";
import Order from "../views/order/Order.vue";
import Login from "../views/Login.vue";   // fix the path if needed

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    redirect: "/planner",
  },
  {
    path: "/planner",
    name: "Planner",
    component: Planner,
    meta: { requiresAuth: true },
  },
  {
    path: "/order",
    name: "Order",
    component: Order,
    meta: { requiresAuth: true },
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
  },
  {
    path: "/about",
    name: "About",
    component: () => import("../views/About.vue"),
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

// Global navigation guard
router.beforeEach((to, from, next) => {
  const isAuthenticated = store.getters["auth/isAuthenticated"];

  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isAuthenticated) {
      next({
        path: "/login",
        query: { redirect: to.fullPath }
      });
    } else {
      next();
    }
  } else if (to.path === "/login" && isAuthenticated) {
    next("/planner");   // already logged in → go to planner
  } else {
    next();
  }
});

export default router;
