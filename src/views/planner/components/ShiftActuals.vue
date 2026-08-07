<template>
  <div>
    <v-skeleton-loader
      v-if="cGlobalSelectedLoadingStatus.plannersLoading"
      class="mx-auto"
      type="table"
    ></v-skeleton-loader>
    <div
      v-else
      x-small
      v-for="spec in ['V', 'S', 'L', 'P', 'CH']"
      :key="spec"
      v-bind:style="{
        color: (() => {
          if (
            cSpecializationsCountOnShift[spec] - cActuals[spec] <
            cMinCounts[0].minimalniStav[shiftCode][spec]
          ) {
            //notifyCounts()
            return 'red';
          } else return 'green';
        })(),
        'line-height': '115%',
      }"
    >
      <div x-small v-if="cDebug">
        {{ spec.substring(0, 3) }}: {{ cSpecializationsCountOnShift[spec] }} -
        {{ cMinCounts[0].minimalniStav[shiftCode][spec] }} -
        {{ cActuals[spec] }} =
        {{
          cSpecializationsCountOnShift[spec] -
          cMinCounts[0].minimalniStav[shiftCode][spec] -
          cActuals[spec]
        }}
        {{ cActualsDoplneni[spec] > 0 ? `(+ ${cActualsDoplneni[spec]})` : "" }}

        <!-- + actualsDoplneni[spec] // neodecitat, je videt v zavorce -->
        <!-- 5 min, 10 max, 3 actual 10 - 5 - actual -->
      </div>
      <div v-else>
        {{ spec.substring(0, 3) }}:
        {{
          cSpecializationsCountOnShift[spec] -
          cMinCounts[0].minimalniStav[shiftCode][spec] -
          cActuals[spec]
        }}
        {{ cActualsDoplneni[spec] > 0 ? `(+ ${cActualsDoplneni[spec]})` : "" }}
      </div>
    </div>
    <div x-small v-if="cDebug">
      C: {{ cTotalCount }} - {{ cMinCounts[0].minimalniStav[shiftCode].C }} -
      {{ cActuals.C }} =
      {{ cTotalCount - cMinCounts[0].minimalniStav[shiftCode].C - cActuals.C }}
    </div>
    <div v-else>
      C:
      {{ cTotalCount - cMinCounts[0].minimalniStav[shiftCode].C - cActuals.C }}
x
    </div>
    <div x-small>
      dop {{ cFillingCountForSelectedDate }}
    </div>
  </div>
</template>

<script>
/*import Vue from "vue";
import api from "@/config/api";
import fadHelper from "@/fadHelper";
*/

export default {
  props: {
    //o: Object,
    date: String,
    shiftCode: String,
  },
  data: () => ({
    dSpecializationsCountOnShiftMin: { V: 0, S: 0, L: 0, P: 0, CH: 0, C: 0 }, // defaults in case that not in DB
  }),
  computed: {
    cMinCounts: function () {
      if (this.cGlobalSelectedFireStationSettings.length > 0) {
        return this.cGlobalSelectedFireStationSettings.map((s) => {
          if (s.key == "minimalniStav") return JSON.parse(s.value);
        });
      } else
        return [
          {
            minimalniStav: {
              A: this.dSpecializationsCountOnShiftMin,
              B: this.dSpecializationsCountOnShiftMin,
              C: this.dSpecializationsCountOnShiftMin,
            },
          },
        ];
    },
    cGlobalSelectedFireStationSettings: function () {
      return this.$store.state.stateGlobalDataForSelected.fireStationSettings;
    },
    cSpecializationsCountOnShift: function () {
      return this.$store.getters["getterSpecializationsCountOnSelectedShift"];
      // return { V: 0, S: 0, L: 0, P: 0, CH: 0 }
    },
    cActuals: function () {
      var planner =
        this.$store.getters["getterSpecializationsCountInLoadedPlanner"];
      if (Object.prototype.hasOwnProperty.call(planner, this.date))
        return planner[this.date].actuals;
      else return { V: 0, S: 0, L: 0, P: 0, CH: 0, C: 0 };
    },
    cTotalCount: function () {
      return this.$store.getters["getterTotalCountOnShiftForSelectedDate"];
    },
    cActualsDoplneni: function () {
      var planner =
        this.$store.getters["getterSpecializationsCountInLoadedPlanner"];
      if (Object.prototype.hasOwnProperty.call(planner, this.date))
        return planner[this.date].actualsDoplneni;
      else return { V: 0, S: 0, L: 0, P: 0, CH: 0 };
    },
    cGlobalSelectedLoadingStatus: function () {
      //return this.$store.state.stateGlobalSelectedLoadingStatus;
      return false;
    },
    cDebug: function () {
      return false;
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
