import Vue from "vue";
import apiConfig from "@/config/config";

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
      state.user = data.user;
      state.id = data.id;
      state.permissions = data.permissions || [];
      state.shiftCodes = data.shiftCodes || [];
      state.shiftIds = data.shiftIds || [];
      state.fireStationIds = data.fireStationIds || [];
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("id", data.id);
    },

    RESTORE_AUTH(state) {
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
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("id");
    },
  },

  actions: {
    async login({ commit, dispatch, state, rootState }, { email, password }) {
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
        "actionLoadGlobalDataForSelectedMonthPlanners",
        null,
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
        "actionLoadGlobalDataForSelectedMonthPlanners",
        null,
        { root: true }
      );
    },
  },

  getters: {
    isAuthenticated: (state) => !!state.token,
    user: (state) => state.user,
    token: (state) => state.token,
    id: (state) => state.id,
    permissions: (state) => state.permissions,
  },
};
