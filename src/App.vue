<template>
  <v-app id="inspire">
    <navigation> </navigation>

    <v-app-bar app>
      <v-app-bar-nav-icon @click="onClick"></v-app-bar-nav-icon>

      <v-toolbar-title>FAD v4</v-toolbar-title>
      <global-data></global-data>
      <v-spacer></v-spacer>
      <v-btn icon :to="{ path: '/planner' }">
        <v-icon>mdi-calendar-month</v-icon>
      </v-btn>
      <v-btn icon :to="{ path: '/order' }">
        <v-icon>mdi-fire</v-icon>
      </v-btn>
      <v-btn icon @click="toggleTheme">
        <v-icon>{{ $vuetify.theme.dark ? "mdi-weather-sunny" : "mdi-weather-night" }}</v-icon>
      </v-btn>
    </v-app-bar>
    <loading is-full-page :active="$store.state.loading"></loading>
    <v-main>
      <global-data-selector></global-data-selector>
      <!--  -->
      <router-view />
    </v-main>
  </v-app>
</template>

<script>
import Navigation from "@/components/Navigation.vue";
import { mapMutations } from "vuex";
import { mapState } from "vuex";
import GlobalData from "./components/GlobalData.vue";
import GlobalDataSelector from "./components/GlobalDataSelector.vue";
import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/vue-loading.css";

export default {
  name: "App",
  components: {
    Navigation,
    GlobalData,
    GlobalDataSelector,
    Loading,
  },
  data: () => ({}),
  computed: {
    ...mapState([
      "stateNavigationDisplayed",
      "stateGlobalDataSelectorDisplayed",
    ]),
  },
  methods: {
    onClick: function () {
      this.mutationSetDrawer({
        //drawer: !this.$store.state.stateNavigationDisplayed,
        drawer: !this.stateNavigationDisplayed,
      });
    },
    onGlobalDataSelectorClick: function () {
      this.mutationSetGlobalDataSelector({
        GlobalDataSelector: !this.stateGlobalDataSelectorDisplayed,
      });
    },
    onCancel() {
      console.log("User cancelled the loader.");
    },
    toggleTheme() {
      this.$vuetify.theme.dark = !this.$vuetify.theme.dark;
      localStorage.setItem(
        "fad-theme",
        this.$vuetify.theme.dark ? "dark" : "light"
      );
    },
    ...mapMutations(["mutationSetDrawer", "mutationSetGlobalDataSelector"]),
  },
  created() {
    const saved = localStorage.getItem("fad-theme");
    if (saved === "light" || saved === "dark") {
      this.$vuetify.theme.dark = saved === "dark";
    } else if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      this.$vuetify.theme.dark = true;
    }
  },
  mounted() {
    //this.$nextTick();
    console.log("App.vue/mounted(): 1.");
    this.$store.state.loading = false;
  },
};
</script>

<style>
/* Rozkaz (Order) tables: bigger headers + green tint on hover */
.order-page .v-data-table th {
  font-size: 16px;
}
.order-page .v-data-table:hover .v-data-table__wrapper table {
  background-color: rgba(76, 175, 80, 0.22);
}
.order-page .crew-card:hover > .v-card__subtitle {
  color: #4caf50 !important;
}
/* Scrollbars: wider + theme-aware */
::-webkit-scrollbar {
  width: 12px;
  height: 12px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
.theme--light ::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.26);
}
.theme--dark ::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.26);
}
::-webkit-scrollbar-thumb:hover {
  background: #4caf50;
}
.theme--light {
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.26) transparent;
}
.theme--dark {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.26) transparent;
}
</style>
