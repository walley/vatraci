<template>
  <div>
    <v-skeleton-loader
      v-if="0 != 0"
      class="mx-auto"
      type="list-item"
    ></v-skeleton-loader>
    <template v-else>
      <v-row dense no-gutters>
        <v-select
          v-bind:value="member"
          :items="availableMembers"
          :label="position.name"
          :suffix="memberDisplayText"
          item-value="id"
          item-text="Shift.code"
          dense
          height="20"
          loader-height="1"
          hide-selected
          return-object
          append-outer-icon="mdi-delete"
          @click:append-outer="plannerValueDelete"
          @input="selectValueChange"
          :disabled="cReadOnly"
        >
          <template slot="item" slot-scope="{ item }"
            >{{ item.lastName }}, {{ item.firstName }} - {{ item.Shift.code }}
            {{
              item.Specializations.length > 0
                ? " - [" +
                  item.Specializations.map((s) => s.code).toString() +
                  "]"
                : ""
            }}
          </template>
          <template v-slot:selection="{ item }">
            {{ getItemText(item) }}
          </template>
        </v-select>
      </v-row>
    </template>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
//import Vue from "vue";
//import api from '@/config/api'
import fadHelper from "@/fadHelper.js";

export default {
  props: {
    position: Object,
    fireStationId: Number,
    crewId: Number,
    crewName: String,
    date: String,
    shiftId: String,
  },
  data: function () {
    return {
      //member: {},
      plannerId: 0,
      dFillingMembers: [],
    };
  },
  computed: {
    member: {
      get: function () {
        var p = this.$store.state.stateGlobalDataForSelected.planners.find(
          (p) => p.date == this.date && p.PositionId == this.position.id
        );
        if (p) return p.Member;
        else
          return { id: 0, firstName: "N/A", lastName: "N/A", fullName: "---" };
      },
      set: function (val) {
        fadHelper.consoleDebug(
          `Position.vue/computed/member/set(): val:${val} `
        );
      },
    },
    availableMembers: function () {
      const SLUZBA = "Služba";
      const DOPLNENI = "Doplnění";

      var lMembers = this.cGlobalDataForSelected.members;

      var lPlannersInDay = this.cGlobalDataForSelected.planners.filter((p) => {
        return p.date == this.date;
      });
      var lFillingMembersIds = lPlannersInDay
        .filter((p) => {
          let lPlannerMember = p.Member;
          if (lPlannerMember) return p.ShiftId != p.Member.ShiftId;
          else return false;
        })
        .map((m) => m.Member.id);

      var lSelectedShiftMembers = lMembers.filter((m) => {
        return (
          m.Shift.code == this.cGlobalSelected.shiftCode ||
          lFillingMembersIds.includes(m.id)
        );
      });

      /*
      Prislusnici na smene filtrovani
       - jiz obsazeni v planovaci
       -- ale ne na sluzbe
       -- a ne v doplneni
      */

      var lAvailableMembers = lSelectedShiftMembers.filter((m) => {
        let lPlannersInDayWithoutFilling = lPlannersInDay.filter(
          (p) => p.Position.name != DOPLNENI && p.Crew.name != SLUZBA
        );
        let lUsedMembersIdsInPlannerDay = lPlannersInDayWithoutFilling.map(
          (p) => p.MemberId
        );
        return !lUsedMembersIdsInPlannerDay.includes(m.id);
      });

      //lAvailableMembers = lSelectedShiftMembers;

      if (this.crewName == SLUZBA) return lSelectedShiftMembers;
      else return lAvailableMembers;
    },
    memberDisplayText: function () {
      //fadHelper.consoleDebug("memberDisplayText: ", this.member);
      if (Object.keys(this.member).length > 0) {
        //fadHelper.consoleDebug("member found");
        //return `${this.member.fullName} [${this.member.Shift.code}]`
        return `${this.member.fullName}`;
      } else {
        //fadHelper.consoleDebug("member not found");
        return "";
      }
    },
    cReadOnly: function () {
      /*var permissions = JSON.parse(this.$store.state.auth.permissions);
      if (permissions.find((p) => p == "FADFIREFIGHTER")) {
        return true;
      } else return false;
      */
      return false;
    },
    cGlobalDataForSelected: function () {
      return this.$store.state.stateGlobalDataForSelected;
    },
    cGlobalSelected: function () {
      return this.$store.state.stateGlobalSelected;
    },
    //...mapGetters("fad", ["vuexAvailableMembers"]),
    ...mapGetters(["getterFetchData", "getterCreateData"]),
  },
  methods: {
    getItemText(item) {
      return `
    ${item.lastName}, ${item.firstName} -
              ${item.Shift.code} - ${item.FireStation.name}
              ${
                item.Specializations.length > 0
                  ? " - [" +
                    item.Specializations.map((s) => s.code).toString() +
                    "]"
                  : ""
              }
    `;
    },
    plannerValueDelete: async function () {
      var lPlanner = this.$store.state.stateGlobalDataForSelected.planners.find(
        (p) => p.date == this.date && p.PositionId == this.position.id
      );
      await this.plannerDelete(lPlanner);

      var plannerIndex = -1;
      plannerIndex =
        this.$store.state.stateGlobalDataForSelected.planners.findIndex((p) => {
          return p.id == lPlanner.id;
        });
      this.$store.commit(
        "mutationSetGlobalDataForSelectedPlanners_RemovePlanner",
        {
          plannerIndex: plannerIndex,
        }
      );
      this.plannerId = 0;
    },
    plannerValueUpdate: async function () {},
    plannerValueCreate: async function (value) {
      var lPlanner = await this.plannerCreate({
        date: this.date,
        FireStationId: this.fireStationId,
        CrewId: this.crewId,
        PositionId: this.position.id,
        ShiftId: this.shiftId,
        MemberId: value.id,
      });
      this.$store.commit(
        "mutationSetGlobalDataForSelectedPlanners_PushPlanner",
        {
          planner: lPlanner,
        }
      );
      this.plannerId = lPlanner.id;
    },
    selectValueChange: async function (value) {
      fadHelper.consoleDebug(
        `Position.vue/selecValueChange(): value:${JSON.stringify(value)}`
      );
      if (this.plannerId != 0) await this.plannerValueDelete();
      if (this.plannerId == 0) await this.plannerValueCreate(value);
      //else this.plannerValueUpdate();
    },
    setMember: function (/*MemberId*/) {},
    setPlannerId: function (/*PlannerId*/) {},
    savePlannerEntry: async function (/*payload*/) {},
    loadPlannerEntry: async function () {},
    async mFetchFillingMembers() {
      //let lFillingMembers = await this.getterFetchData({
      this.dFillingMembers = await this.getterFetchData({
        path: "planners",
        id: "",
        filter: `date=${this.date}&FireStationId=${this.fireStationId}&Position.name=Doplnění`,
      }); /*.filter(
        (o) =>
          o.FireStationId == this.$store.state.stateGlobalSelected.fireStationId
      );*/
      fadHelper.consoleDebug(
        `Position.vue/mFetchFillingMembers(): 
        date=${this.date}&FireStationId=${this.fireStationId}&Position.name=Doplnění`
      );
      fadHelper.consoleDebug(
        `Position.vue/mFetchFillingMembers(): lFillingMembers = ${console.dir(
          this.dFillingMembers
        )}`
      );

      if (this.dFillingMembers) return this.dFillingMembers;
      else return [];
    },

    onEventOrderChanged(payload) {
      fadHelper.consoleDebug(
        `Position.vue/onEventOrderChanged(): date:${payload.date} 1.`
      );
      fadHelper.consoleDebug(
        `Position.vue/onEventOrderChanged(): date:${payload.date} 2.`
      );
    },
  },
  created: function () {
    /*fadHelper.consoleDebug(
      `Position.vue/created(): props.date:${this.date} props.crewName:${this.crewName} 1.`
    );
    fadHelper.consoleDebug(
      `Position.vue/created(): props.date:${this.date} props.crewName:${this.crewName} 2.`
    );*/
  },
  mounted: function () {
    //this.$root.$on("event-order-changed", this.onEventOrderChanged);
    //this.$root.$on('event-order-changed', this.onEventOrderChanged)
    //this.loadPlannerEntry()
  },
  watch: {
    date: {
      handler(val) {
        //this.loadPlannerEntry()
        fadHelper.consoleDebug(val);
      },
      deep: true,
      immediate: true,
    },
    fireStationId: {
      handler(val) {
        fadHelper.consoleDebug(val);
        //this.loadPlannerEntry()
      },
    },
  },
};
</script>
