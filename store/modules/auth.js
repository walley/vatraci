// src/store/modules/auth.js
import Vue from "vue";
import apiConfig from "@/config/api";

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

      // Persist minimal required fields
      localStorage.setItem("token", state.token);
      localStorage.setItem("user", JSON.stringify(state.user));
      localStorage.setItem("id", state.id);
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

      // Only remove auth-related keys
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("id");
      localStorage.removeItem("authData");
    },
  },

  actions: {
    async login({ commit, dispatch }, { email, password }) {
      const response = await Vue.http.post(apiConfig.auth.login, {
        email,
        password,
      });

      const data = response.body;

      if (!data.token) {
        throw new Error("No token received from server");
      }

      // Save token + user
      commit("SET_AUTH_DATA", data);

      // Load all global data AFTER token is stored
      await dispatch("loadAllGlobalData");

      return data;
    },

    restoreAuth({ commit }) {
      commit("RESTORE_AUTH");
    },

    logout({ commit }) {
      commit("LOGOUT");
    },

    async loadAllGlobalData({ dispatch }) {
      console.log("auth/loadAllGlobalData: starting full data load");

      await dispatch("actionLoadGlobalData", null, { root: true });
      await dispatch("actionLoadGlobalDataForSelected", null, { root: true });
      await dispatch("actionLoadGlobalDataForSelectedMonthPlanners", null, {
        root: true,
      });
      await dispatch("actionLoadVacationCountsForSelectedYear", null, {
        root: true,
      });

      console.log("auth/loadAllGlobalData: finished");
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
