<template>
  <!-- v-dialog :value="dialog" max-width="290" -->
  <v-card>
    <v-card-title>Nepřítomnost</v-card-title>
    <v-card-text>
      <v-row>
        <v-data-table
          hide-default-footer
          show-group-by
          dense
          :headers="headers"
          :items="unavailability"
          group-by="PositionId"
          class="elevation-1"
        ></v-data-table>
      </v-row>
    </v-card-text>
  </v-card>
  <!-- /v-dialog -->
</template>

<script>
//import { mapGetters } from "vuex";
/* import { mapActions } from 'vuex'
 */

export default {
  props: {
    date: String,
    fireStationId: Number,
  },
  data: () => ({
    // dialog: false,
    headers: [
      /*{
        text: 'Id',
        align: 'left',
        sortable: true,
        value: 'id',
        groupable: false,
      },
      */
      { text: "Datum", value: "updatedAt" },
      { text: "Jméno", value: "Member.fullName", groupable: false },
      { text: "Nedostupnost", value: "Position.name", groupable: true },
      //{ text: 'Nedostupnost Id', value: 'PositionId', groupable: true },
    ],
  }),
  computed: {
    unavailability: {
      get: function () {
        var lPlanners =
          this.$store.state.stateGlobalDataForSelected.planners.filter(
            (p) =>
              p.FireStationId == this.fireStationId &&
              p.date == this.date &&
              p.Crew.name == "Nepřítomnost"
          );
        //if (p) return p.Member;
        if (lPlanners) return lPlanners;
        else return [];
      },
    },
    unavailability1: {
      get() {
        if (this.$store.state.order.unavailability)
          return this.$store.state.order.unavailability.filter(
            (u) =>
              u.FireStation.id ==
              this.$store.state.stateGlobalSelected.fireStationId
          );
        else return [];
      },
      set(id) {
        // this.$store.dispatch('fad/actionUpdatePosition', { id: id, crew: 'vyjezd1', position: 'strojnik' })
        console.debug(id);
      },
    },
  },
  methods: {},
};
</script>
