<template>
  <v-row no-gutter>
    <!-- v-container fluid -->
    <v-expansion-panels>
      <v-expansion-panel accordion tile>
        <v-expansion-panel-header ripple>
          <v-row no-gutter>
            <!-- Month Selection -->
            <v-col>
              <div class="d-flex align-center">
                <v-btn icon class="ml-4" @click.stop="mPreviousMonth">
                  <v-icon size="52">mdi-menu-left</v-icon>
                </v-btn>
                <v-menu
                  v-model="menuSelectedMonth"
                  :close-on-content-click="false"
                >
                  <template v-slot:activator="{ on }">
                    <v-text-field
                      v-model="cGlobalSelectedMonth"
                      label="Kalendařní měsíc"
                      prepend-icon="mdi-calendar-edit"
                      readonly
                      v-on="on"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    type="month"
                    v-model="cGlobalSelectedMonth"
                    @input="menuSelectedMonth = false"
                  ></v-date-picker>
                  <v-btn
                    icon
                    small
                    @click="menuSelectedMonth = false"
                    style="position: absolute; top: 4px; right: 4px"
                  >
                    <v-icon>mdi-close</v-icon>
                  </v-btn>
                </v-menu>
                <v-btn icon class="mr-4" @click.stop="mNextMonth">
                  <v-icon size="52">mdi-menu-right</v-icon>
                </v-btn>
              </div>
            </v-col>
          </v-row>
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-row no-gutter>
            <!-- Shift Selection -->
            <!-- Shifts filtered for empty if FireStations filtered is empty -->
            <v-col>
              <v-select
                v-model="cGlobalSelectedShiftCode"
                :items="
                  cGlobalData.shifts.filter(
                    (s) =>
                      cGlobalData.fireStations.filter(
                        (f) =>
                          f.TerritorialDistrictId ==
                          cGlobalSelectedTerritorialDistrictId
                      ).length > 0
                  )
                "
                item-text="name"
                item-value="code"
                label="Směna (global)"
                :loading="
                  this.$store.state.stateGlobalLoadingStatus.shiftsLoading
                "
              ></v-select>
            </v-col>
            <!-- FireStation Selection -->
            <v-col>
              <v-select
                v-model="cGlobalSelectedFireStationId"
                :items="
                  cGlobalData.fireStations.filter(
                    (f) =>
                      f.TerritorialDistrictId ==
                      cGlobalSelectedTerritorialDistrictId
                  )
                "
                item-text="name"
                item-value="id"
                label="Stanice (global)"
                :loading="
                  this.$store.state.stateGlobalLoadingStatus.fireStationsLoading
                "
              ></v-select>
            </v-col>
            <!-- TerritorialDistrict Selection -->
            <v-col>
              <v-select
                v-model="cGlobalSelectedTerritorialDistrictId"
                :items="
                  cGlobalData.territorialDistricts.filter(
                    (t) =>
                      t.FireRescueServiceId ==
                      cGlobalSelectedFireRescueServiceId
                  )
                "
                item-text="name"
                item-value="id"
                label="Územní odbor (global)"
                :loading="
                  this.$store.state.stateGlobalLoadingStatus
                    .territorialDistrictsLoading
                "
              ></v-select>
            </v-col>
            <!-- FireRescueService Selection -->
            <v-col>
              <v-select
                v-model="cGlobalSelectedFireRescueServiceId"
                :items="cGlobalData.fireRescueServices"
                item-text="name"
                item-value="id"
                label="HZS (global)"
                :loading="
                  this.$store.state.stateGlobalLoadingStatus
                    .fireRescueServicesLoading
                "
              ></v-select>
            </v-col>

            <v-col>
              <v-btn
                icon
                @click.stop="
                  $store.dispatch('actionLoadPlannersForSelectedMonth')
                "
              >
                <v-icon>mdi-refresh</v-icon>
              </v-btn>
            </v-col>
            <!-- v-spacer / -->
            <v-col v-if="false" cols="1">
              <v-switch v-model="debug" dense label="Debug"></v-switch>
            </v-col>
          </v-row>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
    <!-- /v-container -->
  </v-row>
</template>

<script>
export default {
  data: () => ({
    menuSelectedMonth: false,
  }),
  computed: {
    cGlobalData: function () {
      return this.$store.state.stateGlobalData;
    },
    cGlobalDataForSelected: function () {
      return this.$store.state.stateGlobalDataForSelected;
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
    cGlobalSelectedFireStationId: {
      get() {
        return this.$store.state.stateGlobalSelected.fireStationId;
      },
      set(value) {
        this.$store.dispatch("actionChangeSelectedFireStationId", {
          fireStationId: value,
        });
        //this.dTableKey += 1;
        //this.dShiftActualsKey += 1;
      },
    },
    cGlobalSelectedTerritorialDistrictId: {
      get() {
        return this.$store.state.stateGlobalSelected.territorialDistrictId;
      },
      set(value) {
        this.$store.dispatch("actionChangeSelectedTerritorialDistrictId", {
          territorialDistrictId: value,
        });
      },
    },
    cGlobalSelectedFireRescueServiceId: {
      get() {
        return this.$store.state.stateGlobalSelected.fireRescueServiceId;
      },
      set(value) {
        this.$store.dispatch("actionChangeSelectedFireRescueServiceId", {
          fireRescueServiceId: value,
        });
      },
    },
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
  },
  methods: {
    async mPreviousMonth() {
      await this.$store.dispatch("actionChangeSelectedMonth", {
        month: new Date(
          new Date(this.cGlobalSelectedMonth).setMonth(
            new Date(this.cGlobalSelectedMonth).getMonth() - 1
          )
        )
          .toISOString()
          .substr(0, 7),
      });
    },
    async mNextMonth() {
      await this.$store.dispatch("actionChangeSelectedMonth", {
        month: new Date(
          new Date(this.cGlobalSelectedMonth).setMonth(
            new Date(this.cGlobalSelectedMonth).getMonth() + 1
          )
        )
          .toISOString()
          .substr(0, 7),
      });
    },
  },
};
</script>

<style scoped>
::v-deep .v-date-picker-title__year {
  font-size: 24px !important;
}
</style>
