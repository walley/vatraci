import Vue from "vue";
import fadHelper from "@/fadHelper";

Vue.mixin({
  methods: {
    async plannerRead(planner) {
      var method = "get";
      var fetchUrl = "";
      fetchUrl = fadHelper.gp(`planners/${planner.id}`);
      var body = {};

      try {
        var response = await Vue.http({
          url: fetchUrl,
          method: method,
          body: JSON.stringify(body),
          headers: { "content-type": "application/json" },
        });

        var result = await response.json();

        return result; // set ID after post
      } catch (error) {
        fadHelper.consoleDebug(
          `helperMixin.js/plannerRead() - error - ${error}`
        );
      }
    },
    async plannerUpdate(planner) {
      //var method = "update";
      var fetchUrl = "";
      fetchUrl = fadHelper.gp(`planners/${planner.id}`);
      fadHelper.consoleDebug(`${fetchUrl}`);
    },
    async plannerDelete(planner) {
      var method = "delete";
      var fetchUrl = "";
      fetchUrl = fadHelper.gp(`planners/${planner.id}`);
      var body = {}


      try {
        var response = await Vue.http({
          url: fetchUrl,
          method: method,
          body: JSON.stringify(body),
          headers: { "content-type": "application/json" },
        });

        var result = await response.json();

        return result;
      } catch (error) {
        fadHelper.consoleDebug(
          `helperMixin.js/plannerDelete() - error - ${error}`
        );
      }

    },
    async plannerCreate(planner) {
      fadHelper.consoleDebug(
        `helperMixin.js/methods/plannerAdd(planner=${planner})`
      );

      var body = {
        date: planner.date,
        FireStationId: planner.FireStationId,
        CrewId: planner.CrewId,
        PositionId: planner.PositionId,
        ShiftId: planner.ShiftId,
        MemberId: planner.MemberId,
        //id: planner.id,
      };

      var fetchUrl = fadHelper.gp(`planners`);
      var method = "post";

      try {
        var response = await Vue.http({
          url: fetchUrl,
          method: method,
          body: JSON.stringify(body),
          headers: { "content-type": "application/json" },
        });

        var result = await response.json();

        return this.plannerRead({ id: result.id }); // set ID after post
      } catch (error) {
        fadHelper.consoleDebug(
          `helperMixin.js/plannerCreate() - error - ${error}`
        );
      }
    },
  },
});
