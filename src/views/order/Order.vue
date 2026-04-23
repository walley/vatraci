<template>
  <div>
    <!-- ORDER -->
    <!-- ORDER has many CREWS-->
    <!-- CREW has many POSITIONS -->
    <!-- v-col -->
    <v-row no-gutter>
      <v-expansion-panels>
        <v-expansion-panel accordion tile>
          <v-expansion-panel-header ripple>
            <v-row no-gutter>
              <v-col>
                <v-btn icon @click.stop="prevDate">
                  <v-icon>mdi-arrow-left-bold</v-icon>
                </v-btn>
                {{ cDate }} - {{ functionShiftCode(cDate) }}
                <v-btn icon @click.stop="nextDate">
                  <v-icon>mdi-arrow-right-bold</v-icon>
                </v-btn>
              </v-col>
            </v-row>
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <v-row no-gutter>
              <!-- v-col cols="3" -->
              <v-col>
                <v-date-picker
                  v-model="cDate"
                  :landscape="landscape"
                  :reactive="reactive"
                  :full-width="fullWidth"
                  :show-current="showCurrent"
                  :type="month ? 'month' : 'date'"
                  :multiple="multiple"
                  :readonly="readonly"
                  :disabled="disabled"
                  :events="enableEvents ? functionEvents : null"
                  :picker-date.sync="pickerDate"
                  locale="cs-CZ"
                  @change="eventChangeDate"
                ></v-date-picker>
              </v-col>
            </v-row>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-row>
    <v-row>
      <v-col>
        <order-actuals
          :shift="cShift"
          :fireStationId="this.$store.state.stateGlobalSelected.fireStationId"
          :date="cDate"
        >
        </order-actuals>
      </v-col>
    </v-row>
    <!-- v-divider></v-divider -->
    <v-card>
      <v-card-subtitle>Rozkaz: {{ cDate }}</v-card-subtitle>
      <!-- v-btn @click="getCrews">GetCrews</v-btn -->
      <!-- v-date-picker v-model="date"></v-date-picker -->

      <!-- v-skeleton-loader
        v-if="cGlobalSelectedLoadingStatus.orderLoading"
        class="mx-auto"
        type="card"
      ></v-skeleton-loader>
      <template v-else-->
      <template>
        <!-- {{ JSON.stringify(this.$store.state.fad.stateGlobalDataForSelected.planners) }} -->
        <!-- /template -->
        <div v-if="0 == 0">
          <v-row>
            <v-col v-for="(crew, c) in crews" :key="c + cDate">
              <!-- CREW -->
              <!-- {{ crew.name }} -->
              <crew :crew="crew" :date="cDate"></crew>
              <!-- 
              <div>{{ crew.name }}</div>
              <v-list>
                <v-list-item
                  v-for="(
                    item, i
                  ) in $store.state.stateGlobalDataForSelected.planners.filter(
                    (p) => {
                      return (p.CrewId == crew.id) & (p.date == cDate);
                    }
                  )"
                  :key="i"
                >
                  <v-list-item-content>
                    <v-list-item-title
                      v-text="item.Position.name + ': ' + item.Member.fullName"
                    ></v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
              -->
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <order-notes
                :shift="cShift"
                :fireStationId="
                  this.$store.state.stateGlobalSelected.fireStationId
                "
                :date="cDate"
              ></order-notes>
              <order-member-filling
                :shift="cShift"
                :fireStationId="
                  this.$store.state.stateGlobalSelected.fireStationId
                "
                :date="cDate"
              ></order-member-filling>
              <order-unavailability
                :date="cDate"
                :fireStationId="
                  this.$store.state.stateGlobalSelected.fireStationId
                "
              >
              </order-unavailability>
            </v-col>
          </v-row>
          <!-- 
          <v-row dense>
            <v-col>
              <order-unavailability></order-unavailability>
            </v-col>
            <v-col>
              <order-doplneni></order-doplneni>
            </v-col>
          </v-row>
	  -->
          <v-row>
            <v-btn @click="onPrint">Tisk</v-btn>
          </v-row>
        </div>
      </template>
    </v-card>
    <!-- /v-col -->
  </div>
</template>

<script>
import Crew from "./components/Crew";
import OrderNotes from "./components/OrderNotes.vue";
import OrderMemberFilling from "./components/OrderMemberFilling.vue";
import OrderActuals from "./components/OrderActuals.vue";
import OrderUnavailability from "./components/OrderUnavailability.vue";

export default {
  components: {
    Crew,
    OrderNotes,
    OrderMemberFilling,
    OrderActuals,
    OrderUnavailability,
  },
  data: () => ({
    landscape: false,
    reactive: true,
    fullWidth: false,
    showCurrent: true,
    month: false,
    multiple: false,
    readonly: false,
    disabled: false,
    enableEvents: true,
    pickerDate: new Date().toISOString().substr(0, 10),
  }),

  methods: {
    nextDate: function () {
      var d = new Date(this.cDate);
      d.setDate(d.getDate() + 3);
      this.cDate = d.toISOString().substr(0, 10);
    },
    prevDate: function () {
      var d = new Date(this.cDate);
      d.setDate(d.getDate() - 3);
      this.cDate = d.toISOString().substr(0, 10);
    },
    functionShiftCode: function (date) {
      const _MS_PER_DAY = 1000 * 60 * 60 * 24;
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
    dateFunctionEvents(date) {
      if (this.functionShiftCode(date) === "A") return ["green"];
      if (this.functionShiftCode(date) === "B") return ["yellow"];
      if (this.functionShiftCode(date) === "C") return ["red"];
      return false;
    },
    monthFunctionEvents(/*date*/) {
      return false;
    },
    async eventChangeDate(value) {
      //this.$store.commit("mutationSetGlobalSelectedDate", { date: value });
      this.$store.dispatch("actionChangeSelectedDate", { date: value });
      /*var shiftCode = this.functionShiftCode(value);*/
      this.$root.$emit("event-order-changed", { date: value });
    },
    onPrint: function () {
      console.debug(
        `onPrint: date: ${this.cDate}, fireStationId: ${this.$store.state.stateGlobalSelected.fireStationId}, shiftId: ${this.cShift.id}`
      );
      this.$store.dispatch("actionPrintReport", {
        date: this.cDate,
        fireStationId: this.$store.state.stateGlobalSelected.fireStationId,
        shiftId: this.cShift.id,
      });
    },
  },
  computed: {
    cDate: {
      get: function () {
        return this.$store.state.stateGlobalSelected.date;
      },
      // setter
      set: function (newValue) {
        this.$store.dispatch("actionChangeSelectedDate", { date: newValue });
        //this.$store.state.stateGlobalSelected.date = newValue;
      },
    },
    cShift: function () {
      return this.$store.state.stateGlobalData.shifts.find(
        (s) => s.code == this.functionShiftCode(this.cDate)
      );
    },
    crews: function () {
      return this.$store.state.stateGlobalDataForSelected.crews
        .filter((c) => {
          return (
            c.showInOrder == 1 &&
            c.FireStation.id ==
              this.$store.state.stateGlobalSelected.fireStationId
          );
        })
        .sort((a, b) => (a.sortValue > b.sortValue ? 1 : -1));
    },
    functionEvents() {
      return this.month ? this.monthFunctionEvents : this.dateFunctionEvents;
    },
  },
};
</script>
