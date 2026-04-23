import Vue from "vue";
import Vuex from "vuex";
import fadHelper from "@/fadHelper.js";
import auth from "./modules/auth";
Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    auth,
  },
  state: {
    stateNavigationDisplayed: false,
    stateGlobalDataSelectorDisplayed: false,
    loading: true,
    ////
    stateGlobalData: {
      shifts: [],
      fireStations: [],
      territorialDistricts: [],
      fireRescueServices: [],
    },
    stateGlobalDataForSelected: {
      crews: [],
      positions: [],
      members: [],
      planners: [],
      fireStationSettings: [],
      vacationActuals: [],
    },
    stateGlobalSelected: {
      shiftCode: "A",
      fireStationId: 0,
      territorialDistrictId: 0,
      fireRescueServiceId: 0,
      date: new Date().toISOString().substr(0, 10),
      month: new Date().toISOString().substr(0, 7),
      //date: "",
      //month: "",
    },
    stateGlobalLoadingStatus: {},
    statePlanner: {
      selectedPlannerDay: {},
    },
  },
  mutations: {
    // 1. GLOBAL DATA
    // 2. GLOBAL DATA FOR SELECTED
    // 3. GLOBAL SELECTED

    // ## SET GLOBAL DATA
    mutationSetGlobalDataShifts(state, payload) {
      state.stateGlobalData.shifts = payload.shifts;
    },
    mutationSetGlobalDataFireStations(state, payload) {
      state.stateGlobalData.fireStations = payload.fireStations;
    },
    mutationSetGlobalDataTerritorialDistricts(state, payload) {
      state.stateGlobalData.territorialDistricts = payload.territorialDistricts;
    },
    mutationSetGlobalDataFireRescueServices(state, payload) {
      state.stateGlobalData.fireRescueServices = payload.fireRescueServices;
    },
    // ##  SET GLOBAL FOR SELECTED
    mutationSetGlobalDataForSelectedCrews(state, payload) {
      state.stateGlobalDataForSelected.crews = payload.crews;
    },
    mutationSetGlobalDataForSelectedPositions(state, payload) {
      state.stateGlobalDataForSelected.positions = payload.positions;
    },
    mutationSetGlobalDataForSelectedMembers(state, payload) {
      state.stateGlobalDataForSelected.members = payload.members;
    },
    mutationSetGlobalDataForSelectedPlanners(state, payload) {
      state.stateGlobalDataForSelected.planners = payload.planners;
    },
    mutationSetGlobalDataForSelectedPlanners_PushPlanner(state, payload) {
      state.stateGlobalDataForSelected.planners.push(payload.planner);
    },
    mutationSetGlobalDataForSelectedPlanners_RemovePlanner(state, payload) {
      state.stateGlobalDataForSelected.planners.splice(payload.plannerIndex, 1);
    },
    mutationSetGlobalDataForSelectedFireStationSettings(state, payload) {
      state.stateGlobalDataForSelected.fireStationSettings =
        payload.fireStationSettings;
    },
    mutationSetGlobalDataForSelectedVacationActuals(state, payload) {
      state.stateGlobalDataForSelected.vacationActuals =
        payload.vacationActuals;
    },

    // ##  SET GLOBAL SELECTED ID
    mutationSetGlobalSelectedShiftCode(state, payload) {
      state.stateGlobalSelected.shiftCode = payload.shiftCode;
    },
    mutationSetGlobalSelectedFireStationId(state, payload) {
      state.stateGlobalSelected.fireStationId = payload.fireStationId;
      //state.fireStation = state.stateGlobalData.fireStations.find((f) => f.id == payload.fireStationId).name //set fireStation
    },
    mutationSetGlobalSelectedTerritorialDistrictId(state, payload) {
      state.stateGlobalSelected.territorialDistrictId =
        payload.territorialDistrictId;
    },
    mutationSetGlobalSelectedFireRescueServiceId(state, payload) {
      state.stateGlobalSelected.fireRescueServiceId =
        payload.fireRescueServiceId;
    },
    mutationSetGlobalSelectedDate(state, payload) {
      state.stateGlobalSelected.date = payload.date;
    },
    mutationSetGlobalSelectedMonth(state, payload) {
      state.stateGlobalSelected.month = payload.month;
    },

    // #######################################################
    mutationSetDrawer(state, payload) {
      state.stateNavigationDisplayed = payload.drawer;
    },
    mutationSetGlobalDataSelector(state, payload) {
      state.stateGlobalDataForSelected = payload.globalDataSelector;
    },
  },
  actions: {
    actionX: function () {
      console.debug(`actions/actionX(): 1.1`);
    },

    async actionLoadGlobalData({ state, dispatch }) {
      var shifts = await dispatch("actionFetchData", { path: "shifts" });
      state.stateGlobalData.shifts = shifts;
      var fireStations = await dispatch("actionFetchData", {
        path: "fire-stations",
      });
      state.stateGlobalData.fireStations = fireStations;
      var territorialDistricts = await dispatch("actionFetchData", {
        path: "territorial-districts",
      });
      state.stateGlobalData.territorialDistricts = territorialDistricts;
      var fireRescueServices = await dispatch("actionFetchData", {
        path: "fire-rescue-services",
      });
      state.stateGlobalData.fireRescueServices = fireRescueServices;
    },

    async actionLoadGlobalDataForSelected({ state, dispatch, commit }) {
      var crews = await dispatch("actionFetchData", {
        path: "crews",
        filter: `FireStationId=${state.stateGlobalSelected.fireStationId}`,
      });
      commit("mutationSetGlobalDataForSelectedCrews", { crews: crews });

      var positions = await dispatch("actionFetchData", {
        path: "positions",
        filter: `FireStationId=${state.stateGlobalSelected.fireStationId}`,
      });
      commit("mutationSetGlobalDataForSelectedPositions", {
        positions: positions,
      });

      var members = await dispatch("actionFetchData", {
        path: "members",
        filter: `FireStationId=${state.stateGlobalSelected.fireStationId}&active=1`,
      });
      commit("mutationSetGlobalDataForSelectedMembers", { members: members });

      var fireStationSettings = await dispatch("actionFetchData", {
        path: "fire-station-settings",
        filter: `FireStationId=${state.stateGlobalSelected.fireStationId}`,
      });
      commit("mutationSetGlobalDataForSelectedFireStationSettings", {
        fireStationSettings: fireStationSettings,
      });
    },

    async actionLoadGlobalDataForSelectedMonthPlanners({state, dispatch, commit,}) {
      var planners = await dispatch("actionFetchData", {
        path: "planners",
        filter: `month=${state.stateGlobalSelected.month}`,
      });
      commit("mutationSetGlobalDataForSelectedPlanners", {
        planners: planners,
      });
    },

    actionFetchData: async function ({ state }, args) {
      fadHelper.consoleDebug(state);
      fadHelper.consoleDebug(`store/actionFetchData(args): (${args.path}})`);
      var fetchUrl = "";
      fetchUrl = fadHelper.gp(`${args.path}`);
      if (args.id !== undefined) fetchUrl = `${fetchUrl}/${args.id}`;
      if (args.filter !== undefined) fetchUrl = `${fetchUrl}?${args.filter}`;

      var data = await Vue.http
        //.get(`${fetchUrl}/${args.id}?${args.filter}`)
        .get(`${fetchUrl}`)
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
          fadHelper.consoleDebug("store/actionFetchData: response: ", data);
          return data;
        });
      fadHelper.consoleDebug("store/actionFetchData(): data: ", data);
      return data;
    },

    // ## ACTIONS TO MODIFY GLOBAL DATA

    async actionChangeSelectedShiftCode(
      { commit /*dispatch, state*/ },
      payload
    ) {
      await commit("mutationSetGlobalSelectedShiftCode", {
        shiftCode: payload.shiftCode,
      });
    },

    async actionChangeSelectedFireStationId(
      { commit, dispatch, state },
      payload
    ) {
      await commit("mutationSetGlobalSelectedFireStationId", {
        fireStationId: payload.fireStationId,
      });
      //await dispatch("actionLoadSettingsForSelectedFireStation");
      //await dispatch("actionLoadPositionsForSelectedFireStation");
      let shiftCode = "Z";
      if (!payload.fireStationId == 0) shiftCode = "A";
      else shiftCode = "Z";
      await dispatch("actionChangeSelectedShiftCode", { shiftCode: shiftCode });
      // load all FireStation related master data (ciselniky)
      await dispatch("actionLoadGlobalDataForSelected");
      await dispatch("actionChangeSelectedMonth", {
        month: state.stateGlobalSelected.month,
      });
    },

    async actionChangeSelectedTerritorialDistrictId(
      { commit, dispatch, state },
      payload
    ) {
      /*
    1. set TerritorialDistrictId
    2. set selected FireStationId (value is 1st object found after apply of filter)
    */
      await commit("mutationSetGlobalSelectedTerritorialDistrictId", {
        territorialDistrictId: payload.territorialDistrictId,
      });
      let fireStationId = 0;
      let i = state.stateGlobalData.fireStations.find(
        (f) => f.TerritorialDistrictId == payload.territorialDistrictId
      );
      if (i) fireStationId = i.id;
      else fireStationId = 0;
      await dispatch("actionChangeSelectedFireStationId", {
        fireStationId: fireStationId,
      });
    },

    async actionChangeSelectedFireRescueServiceId(
      { commit, dispatch, state },
      payload
    ) {
      await commit("mutationSetGlobalSelectedFireRescueServiceId", {
        fireRescueServiceId: payload.fireRescueServiceId,
      });
      let territorialDistrictId = 0;
      let i = state.stateGlobalData.territorialDistricts.find(
        (t) => t.FireRescueServiceId == payload.fireRescueServiceId
      );
      if (i) territorialDistrictId = i.id;
      else territorialDistrictId = 0;
      await dispatch("actionChangeSelectedTerritorialDistrictId", {
        territorialDistrictId: territorialDistrictId,
      });
    },

    async actionChangeSelectedMonth({ commit, dispatch /*, state*/ }, payload) {
      commit("mutationSetGlobalSelectedMonth", { month: payload.month });
      await dispatch("actionLoadGlobalDataForSelectedMonthPlanners");
      await dispatch("actionLoadVacationCountsForSelectedYear");
    },

    async actionChangeSelectedDate(
      { commit, dispatch, state, getters },
      payload
    ) {
      commit("mutationSetGlobalSelectedDate", { date: payload.date });

      if (payload.date.substr(0, 7) != state.stateGlobalSelected.month)
        await dispatch("actionChangeSelectedMonth", {
          month: payload.date.substr(0, 7),
        });

      if (
        getters.getterShiftCode(payload.date) !=
        state.stateGlobalSelected.shiftCode
      ) {
        await dispatch("actionChangeSelectedShiftCode", {
          shiftCode: getters.getterShiftCode(payload.date),
        });
      }
    },

    // ## VACATION ACTIONS
    async actionLoadVacationCountsForSelectedYear(
      { commit, state } /*payload*/
    ) {
      const year = state.stateGlobalSelected.month.substr(0, 4);
      const fetchUrl = `/api/fad/planner/vacation-actuals?year=${year}&fireStationId=${state.stateGlobalSelected.fireStationId}`;
      Vue.http({
        url: fadHelper.url() + fetchUrl,
        method: "get",
      }).then((response) =>
        response.json().then(
          (json) => {
            commit("mutationSetGlobalDataForSelectedVacationActuals", {
              vacationActuals: json.actuals,
            });
          },
          (reason) =>
            fadHelper.consoleDebug(
              "ERROR: actionLoadVacationCountsForSelectedYear: ",
              reason
            )
        )
      );
    },
    // ## REPORT ACTIONS
    async actionPrintReport(context, payload) {
      fadHelper.consoleDebug(
        `actionPrintReport(): payload=${JSON.stringify(payload)}`
      );
      let fetchUrl = `https://fada.hasici-ol.cz/fad-be/v1/api/fad/reports/order?date=${payload.date}&fireStationId=${payload.fireStationId}&shiftId=${payload.shiftId}`;
      let method = "get";
      return Vue.http({
        url: fetchUrl,
        method: method,
        headers: { "content-type": "application/pdf" },
        responseType: "blob",
      }).then(function (response) {
        //return response.data
        //var fileURL = window.URL.createObjectURL(new Blob([response.data]))
        var blob = new Blob([response.data], { type: "application/pdf" });
        //var b = new Blob();
        //var fileURL = window.URL.createObjectURL(Blob([response.data]))
        var fileURL = window.URL.createObjectURL(blob);
        var fileLink = document.createElement("a");
        fileLink.href = fileURL;
        fileLink.setAttribute("download", "rozkaz.pdf");
        document.body.appendChild(fileLink);
        fileLink.click();
        fileLink.remove();
        window.URL.revokeObjectURL(fileURL);
      });
      //.then(function(data) {})
    },
  },
  getters: {
    getterShiftCode: (/*state*/) => (date) => {
      const _MS_PER_DAY = 1000 * 60 * 60 * 24;
      // const shiftDiff = 3
      const shiftDiff = 3;
      const a = new Date("2015-01-03");
      const b = new Date(date);

      const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
      const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

      var diffDays = Math.floor((utc2 - utc1) / _MS_PER_DAY);
      var shiftCode = "Z";

      if (diffDays % shiftDiff === 0) shiftCode = "A";
      if (diffDays % shiftDiff === 1) shiftCode = "B";
      if (diffDays % shiftDiff === 2) shiftCode = "C";

      return shiftCode;
    },
    getterSpecializationsCountOnSelectedShift: (state) => {
      var specializationsCountOnShift = { V: 0, S: 0, L: 0, P: 0, CH: 0 };
      var members = state.stateGlobalDataForSelected.members.filter(
        (m) =>
          m.Shift.code == state.stateGlobalSelected.shiftCode &&
          m.FireStationId == state.stateGlobalSelected.fireStationId
      );
      var res = members.reduce((counts, m) => {
        return (counts = m.Specializations.reduce((counts, m) => {
          counts[m.code] += 1;
          return counts;
        }, specializationsCountOnShift));
      }, specializationsCountOnShift);
      return res;
    },
    getterTotalCountOnShiftForSelectedDate: (state, getters) => {
      var lShiftCode = "Z";
      lShiftCode = getters.getterShiftCode(state.stateGlobalSelected.date);
      var lMembers = state.stateGlobalDataForSelected.members.filter(
        (m) =>
          m.Shift.code == lShiftCode &&
          m.FireStationId == state.stateGlobalSelected.fireStationId
      );
      var lTotalCount = lMembers.length;
      return lTotalCount;
    },
    getterSpecializationsCountInLoadedPlanner: (state) => {
      fadHelper.consoleDebug(
        `getter.js: getterSpecializationsCountInLoadedPlanner(): 1.`
      );

      var actuals = { V: 0, S: 0, L: 0, P: 0, CH: 0, C: 0 };
      var actualsDoplneni = { V: 0, S: 0, L: 0, P: 0, CH: 0 };

      var plannersActuals = {
        actuals: actuals,
        actualsDoplneni: actualsDoplneni,
      };

      var member = {};

      var planners = state.stateGlobalDataForSelected.planners.filter(
        (p) =>
          p.FireStationId == state.stateGlobalSelected.fireStationId &&
          p.Shift.code == state.stateGlobalSelected.shiftCode &&
          p.Position.available == false
        //p.month == state.stateGlobalSelected.month
      );

      if (Array.isArray(planners) && planners.length) {
        planners.forEach((planner) => {
          if (
            !Object.prototype.hasOwnProperty.call(plannersActuals, planner.date)
          )
            //if (!plannersActuals.hasOwnProperty(planner.date))
            plannersActuals[planner.date] = {
              actuals: { V: 0, S: 0, L: 0, P: 0, CH: 0, C: 0 },
              actualsDoplneni: { V: 0, S: 0, L: 0, P: 0, CH: 0 },
            };

          member = state.stateGlobalDataForSelected.members.find(
            (x) => x.id == planner.MemberId
          );
          if (member)
            member.Specializations.forEach((s) => {
              if (planner.Position.name == "Doplnění")
                plannersActuals[planner.date].actualsDoplneni[s.code] += 1;
              else {
                plannersActuals[planner.date].actuals[s.code] += 1;
              }
            });
          plannersActuals[planner.date].actuals.C += 1; //to calculate sum/all members
        });
      }
      return plannersActuals;
    },
    getterFetchData: (/*state*/) => async (args) => {
      fadHelper.consoleDebug(
        `getterFetchData(args): (${args.path}, ${args.id})`
      );
      var fetchUrl = "";
      fetchUrl = fadHelper.gp(`${args.path}`);

      var data = await Vue.http
        .get(`${fetchUrl}/${args.id}?${args.filter}`)
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
          fadHelper.consoleDebug("getterFetchData: response: ", data);
          return data;
        });
      fadHelper.consoleDebug("getterFetchData(): data: ", data);
      return data;
    },
    getterCreateData: (/*state*/) => async (args) => {
      var bodyText = JSON.stringify(args.body);
      fadHelper.consoleDebug(
        `getterCreateData(args): (path=${args.path}, delete=${args.delete}, body=${bodyText})`
      );

      var fetchUrl = "";
      var method = "";

      if (args.body.id > 0) {
        method = "put";
        fetchUrl = fadHelper.gp(`${args.path}/${args.body.id}`);
      } else {
        method = "post";
        fetchUrl = fadHelper.gp(`${args.path}`);
      }

      if (args.delete == 1) {
        method = "delete";
        fetchUrl = fadHelper.gp(`${args.path}/${args.body.id}`);
      }

      var data = await Vue.http({
        url: fetchUrl,
        method: method,
        body: JSON.stringify(args.body),
        headers: { "content-type": "application/json" },
      })
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
          fadHelper.consoleDebug(
            "getters.js:getterCreateData: response: ",
            data
          );
          return data;
        });
      fadHelper.consoleDebug("getters.js:getterCreateData(): data: ", data);
      return data;
    },
  },
});
