<template>
  <!-- div>Test value: {{ value }} Test value WC: {{ fad.wcValue }}</div -->
  <v-col>
    <v-card min-width="300" hover>
      <v-card-subtitle>{{ crew.name }}</v-card-subtitle>
      <v-divider></v-divider>
      <v-skeleton-loader v-if="0 != 0">
        class="mx-auto" type="list-item" ></v-skeleton-loader
      >
      <v-row v-else dense no-gutters>
        <v-col v-for="(position, p) in sortedPositions" :key="p" cols="12">
          <position
            :position="position"
            :date="date"
            :fireStationId="crew.FireStationId"
            :crewId="crew.id"
            :crewName="crew.name"
            shiftId="1"
          ></position>
        </v-col>
      </v-row>
    </v-card>
  </v-col>
</template>

<script>
import Position from "./Position";
import fadHelper from "@/fadHelper.js";

export default {
  components: {
    Position,
  },
  props: {
    crew: Object,
    date: String,
    positions: Array,
  },
  data: () => ({}),
  computed: {
    sortedPositions: function () {
      return [...this.crew.Positions].sort((a, b) =>
        a.sortValue > b.sortValue ? 1 : -1
      );
    },
    cGlobalDataForSelected: function () {
      return this.$store.state.stateGlobalDataForSelected;
    },
  },
  created: function () {
    fadHelper.consoleDebug(
      `Crew.vue/created(): props.date:${this.date} props.crew.name:${this.crew.name} 1.`
    );
    fadHelper.consoleDebug(
      `Crew.vue/created(): props.date:${this.date} props.crew.name:${this.crew.name} 2.`
    );
  },
  methods: {},
};
</script>
