<template>
  <div>
    <!-- POCTY -->
    <v-row dense>
      <v-col>
        <!-- v-text-field label="Celkem" :value="dTotalCountInPlannerDay" readonly></v-text-field -->
        <v-text-field
          label="Celkem"
          :value="cActuals.C"
          readonly
        ></v-text-field>
      </v-col>
      <v-col>
        <v-text-field
          label="Velitelé"
          :value="cActuals.V"
          readonly
        ></v-text-field>
      </v-col>
      <v-col>
        <v-text-field
          label="Strojníci"
          color="sucess"
          :value="cActuals.S"
          readonly
        ></v-text-field>
      </v-col>
      <v-col>
        <v-text-field label="Lezci" :value="cActuals.L" readonly></v-text-field>
      </v-col>
      <v-col>
        <v-text-field
          label="Chemici"
          :value="cActuals.CH"
          readonly
        ></v-text-field>
      </v-col>
      <v-col>
        <v-text-field
          label="Potápěči"
          :value="cActuals.P"
          readonly
        ></v-text-field>
      </v-col>
    </v-row>
    <!-- 
    <div v-for="spec in ['V', 'S', 'L', 'P', 'CH', 'C']" :key="spec">
      {{ spec }} =
      {{ cActuals[spec] }}
    </div>
    -->
  </div>
</template>

<script>
import fadHelper from "@/fadHelper.js";
/*import Vue from "vue";
import api from "@/config/api";
import fadHelper from "@/fadHelper";
*/

export default {
  props: {
    date: String,
    shiftCode: String,
    fireStationId: Number,
  },
  data: () => ({}),
  computed: {
    cGlobalSelectedFireStationSettings: function () {
      return this.$store.state.stateGlobalDataForSelected.fireStationSettings;
    },
    cActuals: function () {
      var planners =
        this.$store.state.stateGlobalDataForSelected.planners.filter(
          (p) =>
            (p.date == this.date) &
            p.Position.available &
            (p.FireStationId == this.fireStationId) &
            (p.Crew.name != "Služba")
        );

      var actuals = { V: 0, S: 0, L: 0, P: 0, CH: 0, C: 0 };

      /*var V = [];
      var S = [];
      var L = [];
      var P = [];
      var CH = [];
      */

      if (Array.isArray(planners) && planners.length) {
        for (let i = 0; i < planners.length; i++) {
          let planner = planners[i];
          if (planner.MemberId > 0) {
            // pokud je v planovaci prislusnik
            fadHelper.consoleDebug(`planner.MemberId = ${planner.MemberId}`);
            var lMembers = this.cGlobalDataForSelected.members;
            let lMember = lMembers.find((m) => m.id == planner.MemberId);
            if (lMember) {
              if (lMember.Specializations) {
                // pokud ma nejakou specializaci
                for (let ii = 0; ii < lMember.Specializations.length; ii++) {
                  let s = lMember.Specializations[ii];
                  fadHelper.consoleDebug(
                    `planner.Member.Specializations[ii] = ${s.name}`
                  );
                  if ((s.code == "V") & (planner.Position.velitel == true))
                    actuals.V += 1;
                  if ((s.code == "S") & (planner.Position.strojnik == true))
                    actuals.S += 1;
                  if (s.code == "L") actuals.L += 1;
                  if (s.code == "P") actuals.P += 1;
                  if (s.code == "CH") actuals.CH += 1;
                }
              }
            }
          }
        }
      }

      var C = new Set(planners.map((p) => p.MemberId));

      actuals.C = C.size;

      return actuals;

      /*if (planners) return planners;
      else return { V: 0, S: 0, L: 0, P: 0, CH: 0, C: 0 };
      */
    },
    cGlobalSelectedLoadingStatus: function () {
      //return this.$store.state.stateGlobalSelectedLoadingStatus;
      return false;
    },
    cGlobalDataForSelected: function () {
      return this.$store.state.stateGlobalDataForSelected;
    },
    cGlobalSelected: function () {
      return this.$store.state.stateGlobalSelected;
    },
  },
  methods: {},

  mounted() {},
  watch: {
    date: function (val) {
      val;
    },
  },
  created: function () {},
};
</script>
