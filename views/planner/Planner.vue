<template>
  <div>
    <v-card>
      <v-card-title>
        Plánovač [{{ cGlobalSelectedShiftCode }}] {{ selectedCell.date }} -
        {{ selectedCell.item.memberId }} - {{ selectedCell.item.fullName }} -
        {{
          selectedCell.date != ""
            ? selectedCell.item[selectedCell.date].Position.name
            : "-"
        }}
        / ID:
        {{
          selectedCell.date != ""
            ? selectedCell.item[selectedCell.date].id
            : "NA"
        }}
        <v-spacer></v-spacer>
        <!-- v-autocomplete
          v-model="search"
          :items="$store.state.stateGlobalDataForSelected.members"
          item-text="fullName"
          item-value="fullName"
          dense
          multiple
        >
        </v-autocomplete -->
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Hledej"
          single-line
          hide-details
        ></v-text-field>
      </v-card-title>
      <v-data-table
        :headers="cHeaders"
        :items="cItems"
        :items-per-page="-1"
        :search="search"
        mobile
        class="elevation-1"
        dense
      >
        <!-- show-group-by -->
        <template
          v-for="h in cHeaders.filter(
            (h) => (h.value != 'lastName') & (h.value != 'vacation')
          )"
          v-slot:[header+h.value]="{ header }"
        >
          <div
            :key="h.value + 10"
            v-bind:style="{
              color: (() => {
                if (1 == 1) {
                  //notifyCounts()
                  return 'red';
                } else return 'green';
              })(),
            }"
          >
            <!-- X = -->
            <v-btn
              elevation="1"
              plain
              x-small
              @click="goToOrder(header.text)"
              >{{ header.text }}</v-btn
            >
            <br />
          </div>
          <hr :key="h.value + 1000" />
          <shift-actuals
            :date="h.value"
            :shiftCode="cGlobalSelectedShiftCode"
            :key="h.value + '-shift-actuals-'"
          ></shift-actuals>
          <!-- div :key="h.value + 100">Y {{ header }}</div -->
        </template>
        <template v-slot:item.lastName="{ item }">
          {{ item.member.lastName }} {{ item.member.firstName.substr(0, 1) }}.
          {{
            item.member.Specializations.length > 0
              ? "[" +
                item.member.Specializations.map((s) => s.code).toString() +
                "]"
              : ""
          }}
        </template>

        <template
          v-for="h in cHeaders.filter(
            (h) => (h.value != 'lastName') & (h.value != 'vacation')
          )"
          v-slot:[item+h.value]="{ item }"
        >
          <div
            :key="h.value"
            @click="onCellClick($event, { date: h.value, item: item })"
            :style="{
              backgroundColor: `${
                item[h.value].Position.name == 'Dovolená'
                  ? '#b6d5a9' // Zelena
                  : item[h.value].Position.name == 'FDS'
                  ? '#cde2f5'
                  : item[h.value].Position.name == 'FDS svátek'
                  ? '#cde2f5'
                  : item[h.value].Position.name == 'Krev'
                  ? '#cde2f5'
                  : item[h.value].Position.name == 'Služební cesta'
                  ? '#cde2f5'
                  : item[h.value].Position.name == 'Kurz'
                  ? '#cde2f5'
                  : item[h.value].Position.name == 'Jiné'
                  ? '#cde2f5'
                  : item[h.value].Position.name == 'Nemoc'
                  ? '#f3cdcc'
                  : item[h.value].Position.name == 'OČR'
                  ? '#f3cdcc'
                  : item[h.value].Position.name == 'Převelení'
                  ? '#fef2ca'
                  : item[h.value].Position.name == 'LOP'
                  ? '#fce4cc'
                  : ''
              }`,
            }"
          >
            <!--  :class="{
              'green--text': item[h.value].Position.name == 'LOP',
              'red--text': item[h.value].Position.name == 'Nemoc',
            }"
            -->
            {{
              item[h.value]
                ? item[h.value].Position.name.length > 5
                  ? `${item[h.value].Position.name.substr(0, 5)}.`
                  : item[h.value].Position.name
                : "-"
            }}
          </div>
          <!-- v-chip color="blue" :key="h.value" dark label -->
          <!-- shift-actuals :key="h.value + 10" :date="h.value"></shift-actuals -->
        </template>
        <!-- /v-chip -->
      </v-data-table>
    </v-card>
    <v-menu
      top
      :disabled="cReadOnly"
      v-model="dShowMenu"
      :position-x="x"
      :position-y="y"
      absolute
      offset-y
    >
      <!-- SELECTION of UNAVAILABILITY -->
      <v-toolbar dense tile>
        Nepřítomnost <br />
        {{ selectedCell.item.fullName }}
        <v-spacer></v-spacer>
        <v-btn icon @click="onNepritomnostPrint">
          <v-icon>mdi-printer</v-icon>
        </v-btn>
        <v-btn icon @click="onNepritomnostDelete">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
        <v-btn icon @click="onNepritomnostClose">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <!-- v-btn icon @click="dialog = true">
                  <v-icon>mdi-information</v-icon>
                </v-btn -->
      </v-toolbar>
      <v-list dense>
        <v-list-item
          v-for="(position, index) in cPositions"
          :key="index"
          @click="onPositionClick(position)"
        >
          <v-list-item-title>{{ position.name }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>
<script>
import fadHelper from "@/fadHelper";
import Vue from "vue";
import ShiftActuals from "./components/ShiftActuals.vue";
import router from "@/router";

export default {
  components: { ShiftActuals },

  data() {
    return {
      search: "",
      item: "item.",
      header: "header.",
      dShowMenu: false,
      x: 0,
      y: 0,
      selectedCell: {
        date: "",
        item: { memberId: 0, fullName: "", fistName: "", lastName: "" },
      },
      btnColor: "primary",
      backColor: "blue",
      cl1: "red--text",
    };
  },
  methods: {
    show(e) {
      e.preventDefault();
      this.dShowMenu = false;
      this.x = e.clientX;
      this.y = e.clientY;
      this.$nextTick(() => {
        this.dShowMenu = true;
      });
    },
    onRowClick: function (row, detail) {
      alert(`click ${detail.index}`);
    },
    onCellClick: function (e, payload) {
      //console.dir(e);
      this.$store.state.statePlanner.selectedPlannerDay = payload.item;
      this.selectedCell.date = payload.date;
      this.selectedCell.item = payload.item;
      //fadHelper.consoleDebug(`Item: ${JSON.stringify(payload.item)}`);

      this.show(e);
      /*alert(
        `click date:${payload.date} memberId:${payload.item.memberId} fullName:${payload.item.fullName}`
      );
      */
    },
    onNepritomnostPrint: function () {},
    onNepritomnostDelete: function () {
      this.savePlannerDetailForMember(true);
    },
    onNepritomnostClose: function () {},
    onPositionClick: function (position) {
      fadHelper.consoleDebug(
        `Planner.vue/onPositionClick(): Date: ${this.selectedCell.date} - Name: ${this.selectedCell.item.fullName} - Position: ${position.name}/${position.Crew.name} - Member: ${this.selectedCell.item.member.lastName}`
      );
      fadHelper.consoleDebug(
        `Planner.vue/onPositionClick(): selectedCell[selectedCell.date]: ${JSON.stringify(
          this.selectedCell.item[this.selectedCell.date]
        )}  `
      );

      this.selectedCell.item[this.selectedCell.date].PositionId = position.id;
      this.selectedCell.item[this.selectedCell.date].Position = position;

      fadHelper.consoleDebug(
        `Planner.vue/onPositionClick(): id: '${
          this.selectedCell.item[this.selectedCell.date].id
        }'`
      );

      if (
        this.selectedCell.item[this.selectedCell.date].id == 0 ||
        this.selectedCell.item[this.selectedCell.date].id == "" ||
        this.selectedCell.item[this.selectedCell.date].id == undefined
      )
        //pokud jeste neexistuje, udelej push, jinak uz tam je a staci jen zmenit
        this.$store.commit(
          "mutationSetGlobalDataForSelectedPlanners_PushPlanner",
          {
            planner: {
              PositionId: position.id,
              Position: position,
              ShiftId: this.selectedCell.item.member.ShiftId,
              Shift: this.selectedCell.item.member.Shift,
              FireStationId: this.selectedCell.item.member.FireStationId,
              FireStation: this.selectedCell.item.member.FireStation,
              CrewId: position.CrewId,
              Crew: position.Crew,
              MemberId: this.selectedCell.item.memberId,
              Member: this.selectedCell.item.member,
              date: this.selectedCell.date,
              month: this.selectedCell.date.substring(0, 7),
              id: 0,
            },
          }
        );
      this.savePlannerDetailForMember(false);
    },
    savePlannerDetailForMember: function (d) {
      //d = delete (bool)
      var vm = this;

      let planner = undefined;
      let plannerIndex = -1;
      //let planner = { id: 0 };
      plannerIndex =
        vm.$store.state.stateGlobalDataForSelected.planners.findIndex((p) => {
          return (
            p.date == vm.selectedCell.date &&
            p.MemberId == vm.selectedCell.item.memberId
          );
        });
      if (plannerIndex != -1)
        planner =
          vm.$store.state.stateGlobalDataForSelected.planners[plannerIndex];

      //if (planner) item[h.value] = planner.Position.name;
      fadHelper.consoleDebug(
        `Planner.vue/savePlannerDetailForMember(): planner = ${JSON.stringify(
          planner
        )}`
      );
      if (planner) vm.selectedCell.item[vm.selectedCell.date] = planner;

      var body = {
        date: this.selectedCell.date,
        FireStationId: this.selectedCell.item.member.FireStationId,
        CrewId: this.selectedCell.item[vm.selectedCell.date].Position.CrewId,
        PositionId: this.selectedCell.item[vm.selectedCell.date].Position.id,
        ShiftId: this.selectedCell.item.member.ShiftId,
        MemberId: this.selectedCell.item.member.id,
        //id: planner.id,
      };
      var fetchUrl = "";
      var method = "";

      if ((!planner || (planner ? planner.id == 0 : true)) && !d) {
        //if (plannerIndex == -1) {
        fetchUrl = fadHelper.gp(`planners`);
        method = "post";
      } else if (d == true) {
        fetchUrl = fadHelper.gp(`planners/${planner.id}`);
        method = "delete";
      } else {
        fetchUrl = fadHelper.gp(`planners/${planner.id}`);
        method = "put";
      }

      Vue.http({
        url: fetchUrl,
        method: method,
        body: JSON.stringify(body),
        headers: { "content-type": "application/json" },
      })
        .then((response) => {
          response.json().then((result) => {
            if (method != "delete") {
              fadHelper.consoleDebug(
                `Planner.vue/savePlannerDetailForMember(): method is "${method}" 1`
              );
            }
            switch (method) {
              case "delete":
                this.btnColor = "secondary";
                this.$store.commit(
                  "mutationSetGlobalDataForSelectedPlanners_RemovePlanner",
                  { plannerIndex: plannerIndex }
                );
                break;
              case "put": // put case as post case
              case "post":
                vm.selectedCell.item[vm.selectedCell.date].id = result.id; // set ID after post
                vm.btnColor = "primary";
                break;
              default:
                vm.btnColor = "primary";
            }
            vm.$root.$emit("event-planner-detail-changed", result);
            vm.$store.dispatch("actionLoadVacationCountsForSelectedYear");
          });
        })
        .catch((error) => {
          fadHelper.consoleDebug(`Planner.vue - error - ${error}`);
        });
    },
    goToOrder: function (day) {
      this.cGlobalSelectedDate = day;
      router.push({ path: "/order" }).catch((error) => {
        if (error.name != "NavigationDuplicated") {
          throw error;
        }
      });
    },
  },
  computed: {
    cGlobalSelectedDate: {
      get() {
        return this.$store.state.stateGlobalSelected.date;
      },
      set(value) {
        this.$store.dispatch("actionChangeSelectedDate", { date: value });
      },
    },
    cGlobalSelectedMonth: {
      get() {
        return this.$store.state.stateGlobalSelected.month;
      },
      set(value) {
        this.$store.dispatch("actionChangeSelectedMonth", { month: value });
      },
    },
    cGlobalSelectedShiftCode: {
      get() {
        return this.$store.state.stateGlobalSelected.shiftCode;
      },
      set(value) {
        this.$store.dispatch("actionChangeSelectedShiftCode", {
          shiftCode: value,
        });
        // this.$store.commit('fad/mutationSetGlobalSelectedShiftCode', { shiftCode: value })
      },
    },
    cGlobalDataForSelected: function () {
      return this.$store.state.stateGlobalDataForSelected;
    },
    cPositions: function () {
      return this.cGlobalDataForSelected.positions.filter((m) => {
        return (
          m.available == false &&
          m.Crew.FireStationId ==
            this.$store.state.stateGlobalSelected.fireStationId
        );
      });
    },
    cHeaders: function () {
      var daysx = this.cDaysInMonth;
      var headers = [
        { text: "Příslušník", value: "lastName", divider: true },
        { text: "Dov.", value: "vacation" },
      ];
      for (let i = 0; i < daysx.length; i++) {
        let dString = daysx[i];
        if (
          this.$store.getters.getterShiftCode(new Date(dString)) ==
          this.cGlobalSelectedShiftCode
        ) {
          headers.push({
            text: daysx[i], //+ `${this.showMobile ? "x" : "xx"}`,
            value: daysx[i],
            divider: true,
            sortable: false,
            groupable: false,
          });
        }
      }
      return headers;
    },
    cItems: function () {
      const SLUZBA = "Služba";
      var items = [];
      var item = {};

      var members = this.$store.state.stateGlobalDataForSelected.members.filter(
        (m) => m.Shift.code == this.$store.state.stateGlobalSelected.shiftCode
      );

      members.forEach((m) => {
        item = {};
        this.cHeaders.forEach((h) => {
          //item[h.value] = `v-${h.value}`;
          let planner = undefined;
          planner = this.$store.state.stateGlobalDataForSelected.planners.find(
            (p) => {
              return (
                p.date == h.value && p.MemberId == m.id && p.Crew.name != SLUZBA
              );
            }
          );
          //if (planner) item[h.value] = planner.Position.name;
          if (planner) item[h.value] = planner;
          //else item[h.value] = "-";
          else item[h.value] = { Position: { name: "--" } };
        });
        item.member = m;
        item.fullName = m.fullName;
        item.fistName = m.firstName;
        item.lastName = m.lastName;
        item.memberId = m.id;
        //item.vacation = "0/10";
        item.vacationClaimDays = (() => {
          let vacation = m.Vacations.find(
            (v) => v.year == this.cGlobalSelectedMonth.substring(0, 4)
          );
          let days = !vacation ? 0 : vacation.days;

          return days;
        })();

        item.vacationSpentDays = (() => {
          if (this.cGlobalDataForSelected.vacationActuals) {
            let v = this.cGlobalDataForSelected.vacationActuals.find(
              (v) => v.MemberId == m.id
            );
            if (v) return v.spentDays;
            else return 0;
          } else return 0;
        })();
        item.vacation = `${item.vacationClaimDays}/${item.vacationSpentDays}`;

        items.push(item);
      });

      return items;
    },

    cDaysInMonth: function () {
      var dayCount = new Date(
        this.cGlobalSelectedMonth.split("-")[0],
        this.cGlobalSelectedMonth.split("-")[1],
        0
      ).getDate();
      var daysx = [];
      var dString = "";
      for (let i = 0; i < dayCount; i++) {
        dString = `${this.cGlobalSelectedMonth}-${(i + 1)
          .toString()
          .padStart(2, 0)}`;
        //if (this.getterShiftCode(new Date(dString)) == this.cGlobalSelectedShiftCode) {
        daysx.push(dString);
        //}
      }
      return daysx;
    },
    cReadOnly: function () {
      return false;
    },
  },
  created: function () {
    // If members are empty, trigger a data load
    if (!this.$store.state.stateGlobalDataForSelected.members.length) {
      this.$store.dispatch("auth/loadAllGlobalData").catch(() => {});
    }
    console.debug(`Planner.vue/created(): 1.`);
  },
  mounted: function () {
    console.debug(`Planner.vue/mounted(): 1.`);
  },
  beforeRouteEnter(to, from, next) {
    console.debug(`Planner.vue/beforeRouterEnter():`);
    console.debug(to);
    console.debug(from);
    next();
  },

  beforeRouteUpdate(to, from, next) {
    console.debug(`Planner.vue/beforeRouterUpdate(): to:${to} from:${from}`);
    next();
  },
};
</script>
