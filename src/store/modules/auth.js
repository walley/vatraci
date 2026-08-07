import Vue from "vue";
import apiConfig from "@/config/config";

// Čistě frontendový administrátorský uživatel (bez backendového účtu)
const FRONTEND_ADMIN = {
  username: "admin",
  password: "admin1234x",
  permissions: ["ADMIN", "FAD", "FAD-PERMISSIONS", "FADFIREFIGHTER"],
};

export default {
  namespaced: true,

  state: {
    token: localStorage.getItem("token") || null,
    user: JSON.parse(localStorage.getItem("user") || "null"),
    id: localStorage.getItem("id") || null,
    permissions: [],
    shiftCodes: [],
    shiftIds: [],
    fireStationIds: [],
    isRestored: false,
    isFrontendAdmin: localStorage.getItem("isFrontendAdmin") === "true",
  },

  mutations: {
    SET_AUTH_DATA(state, data) {
      state.token = data.token;
      state.user = data.user || null;
      state.id = data.id || null;
      state.permissions = data.permissions || [];
      state.shiftCodes = data.shiftCodes || [];
      state.shiftIds = data.shiftIds || [];
      state.fireStationIds = data.fireStationIds || [];
      state.isRestored = true;
      state.isFrontendAdmin = !!data.isFrontendAdmin;

      localStorage.setItem("token", state.token || "");
      localStorage.setItem("user", JSON.stringify(state.user));
      localStorage.setItem("id", state.id || "");
      localStorage.setItem("isFrontendAdmin", state.isFrontendAdmin ? "true" : "false");
      localStorage.setItem(
        "authData",
        JSON.stringify({
          permissions: state.permissions,
          shiftCodes: state.shiftCodes,
          shiftIds: state.shiftIds,
          fireStationIds: state.fireStationIds,
        })
      );
    },

    RESTORE_AUTH(state) {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "null");
      const id = localStorage.getItem("id");
      const savedAuth = localStorage.getItem("authData");

      if (token) state.token = token;
      if (user) state.user = user;
      if (id) state.id = id;
      state.isFrontendAdmin = localStorage.getItem("isFrontendAdmin") === "true";

      if (savedAuth) {
        try {
          const parsed = JSON.parse(savedAuth);
          state.permissions = parsed.permissions || [];
          state.shiftCodes = parsed.shiftCodes || [];
          state.shiftIds = parsed.shiftIds || [];
          state.fireStationIds = parsed.fireStationIds || [];
        } catch (e) {
          console.warn("Failed to parse saved auth data");
        }
      }

      state.isRestored = true;
    },

    LOGOUT(state) {
      state.token = null;
      state.user = null;
      state.id = null;
      state.permissions = [];
      state.shiftCodes = [];
      state.shiftIds = [];
      state.fireStationIds = [];
      state.isRestored = false;
      state.isFrontendAdmin = false;

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("id");
      localStorage.removeItem("authData");
      localStorage.removeItem("isFrontendAdmin");
    },
  },

  actions: {
    async login({ commit, dispatch, state, rootState }, { email, password }) {
      if (email === FRONTEND_ADMIN.username && password === FRONTEND_ADMIN.password) {
        commit("SET_AUTH_DATA", {
          token: "frontend-admin-token",
          user: { name: "Admin (frontend)", email: FRONTEND_ADMIN.username, active: true },
          id: 0,
          permissions: FRONTEND_ADMIN.permissions,
          isFrontendAdmin: true,
        });
        return { isFrontendAdmin: true };
      }

      const response = await Vue.http.post(apiConfig.auth.login, {
        email,
        password,
      });

      const data = response.body;

      if (!data || !data.token) {
        throw new Error("No token received from server");
      }

      // Save auth data
      commit("SET_AUTH_DATA", data);

      // 1) Load base global data (shifts, fireStations, etc.)
      await dispatch("actionLoadGlobalData", null, { root: true });

      // 2) Select first FireRescueService → cascades to district + fireStation
      const frs = rootState.stateGlobalData.fireRescueServices[0];
      if (frs) {
        await dispatch(
          "actionChangeSelectedFireRescueServiceId",
          { fireRescueServiceId: frs.id },
          { root: true }
        );
      }

      // 3) Load month-dependent data (planners + vacationActuals)
      await dispatch(
        "actionChangeSelectedMonth",
        { month: rootState.stateGlobalSelected.month },
        { root: true }
      );

      return data;
    },

    restoreAuth({ commit }) {
      commit("RESTORE_AUTH");
    },

    logout({ commit }) {
      commit("LOGOUT");
    },

    // Optional helper if you want to trigger full reload from elsewhere
    async loadAllGlobalData({ dispatch, rootState }) {
      if (rootState.auth.isFrontendAdmin) return;

      await dispatch("actionLoadGlobalData", null, { root: true });

      const frs = rootState.stateGlobalData.fireRescueServices[0];
      if (frs) {
        await dispatch(
          "actionChangeSelectedFireRescueServiceId",
          { fireRescueServiceId: frs.id },
          { root: true }
        );
      }

      await dispatch(
        "actionChangeSelectedMonth",
        { month: rootState.stateGlobalSelected.month },
        { root: true }
      );
    },
  },

  getters: {
    isAuthenticated: (state) => !!state.token,
    token: (state) => state.token,
    user: (state) => state.user,
    id: (state) => state.id,
    shiftIds: (state) => state.shiftIds,
    shiftCodes: (state) => state.shiftCodes,
    fireStationIds: (state) => state.fireStationIds,
    permissions: (state) => state.permissions,
    isRestored: (state) => state.isRestored,
  },
};
