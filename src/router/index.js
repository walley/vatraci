import Vue from "vue";
import VueRouter from "vue-router";
import store from "../store";   // ← important
import Placeholder from "../views/Placeholder.vue";

Vue.use(VueRouter);

const Planner = () => import("../views/planner/Planner.vue");
const Order = () => import("../views/order/Order.vue");
const Login = () => import("../views/Login.vue");
const UsersAdmin = () => import("../views/admin/UsersAdmin.vue");
const PermissionsAdmin = () => import("../views/admin/PermissionsAdmin.vue");
const UserPermissionsAdmin = () => import("../views/admin/UserPermissionsAdmin.vue");
const UserTypesAdmin = () => import("../views/admin/UserTypesAdmin.vue");
const OrderNotes = () => import("../views/fad/OrderNotes.vue");
const FireRescueServices = () => import("../views/fad/FireRescueServices.vue");
const FireStations = () => import("../views/fad/FireStations.vue");
const Shifts = () => import("../views/fad/Shifts.vue");
const TerritorialDistricts = () => import("../views/fad/TerritorialDistricts.vue");
const FireStationSettings = () => import("../views/fad/FireStationSettings.vue");
const Crews = () => import("../views/fad/Crews.vue");
const Positions = () => import("../views/fad/Positions.vue");
const Specializations = () => import("../views/fad/Specializations.vue");
const Members = () => import("../views/fad/Members.vue");
const MemberSpecializations = () => import("../views/fad/MemberSpecializations.vue");
const Vacations = () => import("../views/fad/Vacations.vue");
const FadPermissions = () => import("../views/fad/FadPermissions.vue");
const UserFadPermissions = () => import("../views/fad/UserFadPermissions.vue");
const FireStationFadPermissions = () => import("../views/fad/FireStationFadPermissions.vue");
const ShiftFadPermissions = () => import("../views/fad/ShiftFadPermissions.vue");
const FadLogs = () => import("../views/fad/FadLogs.vue");

// Náhradní (placeholder) stránky přenesené z verze 1 (FAD / FAD Oprávnění / Administrace)
const placeholderRoutes = [
  // FAD
  { path: "/fad/planner-raw", title: "Plánovač - RAW" },
  // FAD Oprávnění
  { path: "/fad/fad-permissions", title: "FAD Oprávnění" },
  { path: "/fad/user-fad-permissions", title: "Oprávnění FAD uživatele" },
  { path: "/fad/fire-station-fad-permissions", title: "FAD Oprávnění - Požární stanice" },
  { path: "/fad/shift-fad-permissions", title: "FAD Oprávnění - Směny" },
];

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
    path: "/fad/planner",
    name: "fad-planner",
    component: Planner,
    meta: { requiresAuth: true, title: "Plánovač nepřítomnosti" },
  },
  {
    path: "/fad/order",
    name: "fad-order",
    component: Order,
    meta: { requiresAuth: true, title: "Denní rozkaz" },
  },
  {
    path: "/fad/order-notes",
    name: "fad-order-notes",
    component: OrderNotes,
    meta: { requiresAuth: true, title: "Poznámky k rozkazu" },
  },
  {
    path: "/fad/fire-rescue-services",
    name: "fad-fire-rescue-services",
    component: FireRescueServices,
    meta: { requiresAuth: true, title: "Hasičské záchranné sbory" },
  },
  {
    path: "/fad/fire-stations",
    name: "fad-fire-stations",
    component: FireStations,
    meta: { requiresAuth: true, title: "Požární stanice" },
  },
  {
    path: "/fad/shifts",
    name: "fad-shifts",
    component: Shifts,
    meta: { requiresAuth: true, title: "Směny" },
  },
  {
    path: "/fad/territorial-districts",
    name: "fad-territorial-districts",
    component: TerritorialDistricts,
    meta: { requiresAuth: true, title: "Územní odbory" },
  },
  {
    path: "/fad/fire-station-settings",
    name: "fad-fire-station-settings",
    component: FireStationSettings,
    meta: { requiresAuth: true, title: "Nastavení požární stanice" },
  },
  {
    path: "/fad/crews",
    name: "fad-crews",
    component: Crews,
    meta: { requiresAuth: true, title: "Výjezdy" },
  },
  {
    path: "/fad/positions",
    name: "fad-positions",
    component: Positions,
    meta: { requiresAuth: true, title: "Obsazení výjezdů" },
  },
  {
    path: "/fad/specializations",
    name: "fad-specializations",
    component: Specializations,
    meta: { requiresAuth: true, title: "Odbornosti" },
  },
  {
    path: "/fad/members",
    name: "fad-members",
    component: Members,
    meta: { requiresAuth: true, title: "Příslušníci" },
  },
  {
    path: "/fad/member-specializations",
    name: "fad-member-specializations",
    component: MemberSpecializations,
    meta: { requiresAuth: true, title: "Specializace příslušníků" },
  },
  {
    path: "/fad/vacations",
    name: "fad-vacations",
    component: Vacations,
    meta: { requiresAuth: true, title: "Nárok dovolené" },
  },
  {
    path: "/fad/fad-permissions",
    name: "fad-fad-permissions",
    component: FadPermissions,
    meta: { requiresAuth: true, title: "FAD Oprávnění" },
  },
  {
    path: "/fad/user-fad-permissions",
    name: "fad-user-fad-permissions",
    component: UserFadPermissions,
    meta: { requiresAuth: true, title: "Oprávnění FAD uživatele" },
  },
  {
    path: "/fad/fire-station-fad-permissions",
    name: "fad-fire-station-fad-permissions",
    component: FireStationFadPermissions,
    meta: { requiresAuth: true, title: "FAD Oprávnění - Požární stanice" },
  },
  {
    path: "/fad/shift-fad-permissions",
    name: "fad-shift-fad-permissions",
    component: ShiftFadPermissions,
    meta: { requiresAuth: true, title: "FAD Oprávnění - Směny" },
  },
  {
    path: "/fad/fad-logs",
    name: "fad-fad-logs",
    component: FadLogs,
    meta: { requiresAuth: true, title: "Logy FAD" },
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
  {
    path: "/logout",
    name: "Logout",
    component: () => import("@/views/Logout.vue"),
    meta: { requiresAuth: false }
  },
  {
    path: "/administration/users",
    name: "administration-users",
    component: UsersAdmin,
    meta: { requiresAuth: true, title: "Uživatelé" },
  },
  {
    path: "/administration/permissions",
    name: "administration-permissions",
    component: PermissionsAdmin,
    meta: { requiresAuth: true, title: "Oprávnění" },
  },
  {
    path: "/administration/user-permissions",
    name: "administration-user-permissions",
    component: UserPermissionsAdmin,
    meta: { requiresAuth: true, title: "Uživatelská oprávnění" },
  },
  {
    path: "/administration/user-types",
    name: "administration-user-types",
    component: UserTypesAdmin,
    meta: { requiresAuth: true, title: "Typy uživatelů" },
  },
  ...placeholderRoutes.map((r) => ({
    path: r.path,
    name: r.path.replace(/^\//, "").replace(/\//g, "-"),
    component: Placeholder,
    meta: { requiresAuth: true, title: r.title },
  })),
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
