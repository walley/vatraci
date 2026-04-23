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
          append-outer-icon="delete"
          @click:append-outer="deleteData"
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
        </v-select>
      </v-row>
    </template>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import Vue from "vue";
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
      return this.cGlobalDataForSelected.members;
    },
    availableMembers1: function () {
      fadHelper.consoleDebug("Available: ", this.position.available);
      fadHelper.consoleDebug("Position: ", this.position);
      // if (this.position.available == 'false') return this.vuexAvailableMembers
      // else
      if (this.crewName == "Služba") {
        // kdyz je sluzba, muze se zadat jakekoli jmeno
        /*return this.vuexAvailableMembers.filter((m) => {
          return this.position.available == 'false'
        })
        */
        return this.vuexAvailableMembers.filter((m) => {
          if (this.$store.state.fad.order.unavailability) {
            return !!!this.$store.state.fad.order.unavailability.find(
              (u) => u.MemberId == m.id && u.Position.name != "Doplnění"
            );
          } else return true;
        });
      } else {
        return this.vuexAvailableMembers
          .filter((m) => {
            //console.debug('dSelectedFireStationId', this.$store.state.fad.stateGlobalSelected.fireStationId)
            return (
              m.FireStationId ==
              this.$store.state.fad.stateGlobalSelected.fireStationId
            );
          })
          .filter((m) => {
            // fadHelper.consoleDebug(`m: ${JSON.stringify(m)}`)
            return m.used == "false" || this.position.available == "false";
          })
          .filter((m) => {
            if (this.$store.state.fad.order.unavailability) {
              return !!!this.$store.state.fad.order.unavailability.find(
                (u) => u.MemberId == m.id && u.Position.name != "Doplnění"
              );
            } else return true;
          });
      } //&& u.Position.name != 'Doplnění',
    },
    memberDisplayText: function () {
      fadHelper.consoleDebug("memberDisplayText: ", this.member);
      if (Object.keys(this.member).length > 0) {
        fadHelper.consoleDebug("member found");
        //return `${this.member.fullName} [${this.member.Shift.code}]`
        return `${this.member.fullName}`;
      } else {
        fadHelper.consoleDebug("member not found");
        return "";
      }
    },
    cReadOnly: function () {
      var permissions = JSON.parse(this.$store.state.auth.permissions);
      if (permissions.find((p) => p == "FADFIREFIGHTER")) {
        return true;
      } else return false;
    },
    cGlobalDataForSelected: function () {
      return this.$store.state.stateGlobalDataForSelected;
    },
    ...mapGetters("fad", ["vuexAvailableMembers"]),
  },
  methods: {
    deleteData: async function () {
      this.$store.state.fad.vuexMembers.find(
        ({ id }) => id == this.member.id
      ).used = "false";
      await this.savePlannerEntry({ delete: true });
      this.member = {};
    },
    selectValueChange: function (value) {
      if (Object.keys(this.member).length > 0) {
        // in case that it is already used to appear again in the list
        this.$store.state.fad.vuexMembers.find(
          ({ id }) => id == this.member.id
        ).used = "false";
        this.$store.state.fad.countTotal += -1;
      }
      this.member = value;
      if (this.crewName != "Služba")
        this.$store.state.fad.vuexMembers.find(
          ({ id }) => id == this.member.id
        ).used = "true";
      /*this.$store.state.fad.vuexMembers.find(({ id }) => id == this.member.id).used =
        this.crewName == 'Služba' ? 'false' : 'true'
      */
      this.$store.state.fad.countTotal += 1;
      this.savePlannerEntry({ delete: false });
    },
    setMember: function (MemberId) {
      this.member = this.$store.state.fad.vuexMembers.find(
        ({ id }) => id == MemberId
      );
      fadHelper.consoleDebug("Member ID: ", MemberId);
      fadHelper.consoleDebug(
        "find:",
        this.$store.state.fad.vuexMembers.find(({ id }) => id == MemberId)
      );
      //this.$store.state.fad.vuexMembers.find(({ id }) => id == MemberId)
      fadHelper.consoleDebug(
        "setMember member/MemberId",
        this.member,
        MemberId
      );
      if (this.position.available == "true") {
        if (this.crewName != "Služba")
          this.$store.state.fad.vuexMembers.find(
            ({ id }) => id == MemberId
          ).used = "true";
        /*  this.$store.state.fad.vuexMembers.find(({ id }) => id == MemberId).used =
          this.crewName == 'Služba' ? 'false' : 'true'
      */
        // this.$store.state.fad.vuexMembers.find(({ id }) => id == MemberId).used = 'true'
      }
    },
    setPlannerId: function (PlannerId) {
      this.plannerId = PlannerId;
    },
    savePlannerEntry: async function (payload) {
      fadHelper.consoleDebug("Position.vue:savePlannerEntry()..1");
      var vm = this;
      var body = {
        date: this.date,
        FireStationId: this.fireStationId,
        CrewId: this.crewId,
        PositionId: this.position.id,
        ShiftId: this.shiftId,
        MemberId: this.member.id,
      };
      var fetchUrl = "";
      var method = "";

      console.log(
        `Position.vue/savePlannerEntry()..2: plannerId=${this.plannerId}`
      );

      if (this.plannerId == 0 && !!!payload.delete) {
        fetchUrl = `https://fada.hasici-ol.cz/api/crud/fad/planners/`;
        method = "POST";
      } else {
        fetchUrl = `https://fada.hasici-ol.cz/api/crud/fad/planners/${this.plannerId}`;
        method = payload.delete ? "DELETE" : "PUT";
      }

      Vue.http({
        url: fetchUrl,
        method: method,
        body: JSON.stringify(body),
        headers: { "content-type": "application/json" },
      })
        .then((response) => {
          vm.$root.$emit("event-position-changed", this);
          return response.json();
        })
        .then((json) => {
          this.plannerId = json.id;
          if (this.plannerId == undefined) this.plannerId = 0;
          console.log(
            `Position.vue/savePlannerEntry()..3..http.response: plannerId=${this.plannerId}`
          );
          fadHelper.consoleDebug(response);
          fadHelper.consoleDebug(json);
          vm.$root.$emit("event-position-changed", this);
        })
        .catch((error) => {});
    },
    loadPlannerEntry: async function () {
      fadHelper.consoleDebug("Position.vue/loadPlannerEntry: 1. ");
      this.member = {};
      this.plannerId = 0;
      var planner = {};

      var usedPlanner =
        this.$store.state.fad.stateGlobalDataForSelected.planners.find(
          (p) => p.date == this.date && p.PositionId == this.position.id
        );
      //console.dir('Planners', this.$store.state.fad.stateGlobalDataForSelected.planners)
      fadHelper.consoleDebug(
        `Position.vue/loadPlannerEntry: usedPlanner:${usedPlanner} this.date:${this.date} this.position.id:${this.position.id} 1.5.`
      );

      if (usedPlanner) {
        planner = usedPlanner;
        fadHelper.consoleDebug(
          `Position.vue/loadPlannerEntry: planner:${planner} 2.`
        );
        this.setMember(planner.MemberId);
        this.setPlannerId(planner.id);
        if (this.crewName != "Služba")
          this.$store.state.fad.vuexMembers.find(
            ({ id }) => id == planner.MemberId
          ).used = "true";
      }
      fadHelper.consoleDebug("Position.vue/loadPlannerEntry: 3. ");
      return planner;
    },

    loadPlannerEntry1: function () {
      this.member = {};
      this.plannerId = 0;
      var url = `https://fada.hasici-ol.cz/api/crud/fad/planners?date=${this.date}&PositionId=${this.position.id}`;
      fadHelper.consoleDebug("loadPlannerEntry.url: ", url);
      const vm1 = this;
      // fetch(url)
      Vue.http({
        url: url,
        method: "GET",
        headers: { "content-type": "application/json" },
      })
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
          fadHelper.consoleDebug("loadPlannerEntry.data: ", data);
          if (data.length > 0) {
            vm1.setMember(data[0].MemberId);
            // this.setMember(data[0].MemberId)
            fadHelper.consoleDebug(
              "loadPlannerEntry: ",
              data[0].Member.fullName
            );
            // vm1.plannerId = data[0].id
            vm1.setPlannerId(data[0].id);
            // this.setPlannerId(data[0].id)
            /*vm1.$store.state.fad.vuexMembers.find(({ id }) => id == data[0].MemberId).used =
              vm1.crewName == 'Služba' ? 'false' : 'true'
            */
            if (vm1.crewName != "Služba")
              vm1.$store.state.fad.vuexMembers.find(
                ({ id }) => id == data[0].MemberId
              ).used = "true";
            // this.$store.state.fad.vuexMembers.find(({ id }) => id == data[0].MemberId).used = this.crewName == 'Služba' ? 'false' : 'true'
            // 'true' //set true for loaded member to don't list it in availableMembers
            //vm1.$root.$emit('event-position-changed', this)
          }
        });
    },
    onEventOrderChanged(payload) {
      fadHelper.consoleDebug(
        `Position.vue/onEventOrderChanged(): date:${payload.date} 1.`
      );
      this.loadPlannerEntry();
      fadHelper.consoleDebug(
        `Position.vue/onEventOrderChanged(): date:${payload.date} 2.`
      );
    },
  },
  created: function () {
    fadHelper.consoleDebug(
      `Position.vue/created(): props.date:${this.date} props.crewName:${this.crewName} 1.`
    );
    //this.loadPlannerEntry()
    fadHelper.consoleDebug(
      `Position.vue/created(): props.date:${this.date} props.crewName:${this.crewName} 2.`
    );
  },
  mounted: function () {
    this.$root.$on("event-order-changed", this.onEventOrderChanged);
    //this.$root.$on('event-order-changed', this.onEventOrderChanged)
    //this.loadPlannerEntry()
  },
  watch: {
    date: {
      handler(val) {
        //this.loadPlannerEntry()
      },
      deep: true,
      immediate: true,
    },
    fireStationId: {
      handler(val) {
        //this.loadPlannerEntry()
      },
    },
  },
};
</script>
