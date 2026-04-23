<template>
  <v-app id="inspire">
    <navigation> </navigation>

    <v-app-bar app>
      <v-app-bar-nav-icon @click="onClick"></v-app-bar-nav-icon>

      <v-toolbar-title>FAD v3</v-toolbar-title>
      <global-data></global-data>
      <v-spacer></v-spacer>
      <v-btn icon :to="{ path: '/planner' }">
        <v-icon>mdi-calendar-month</v-icon>
      </v-btn>
      <v-btn icon :to="{ path: '/order' }">
        <v-icon>mdi-fire</v-icon>
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
    ...mapMutations(["mutationSetDrawer", "mutationSetGlobalDataSelector"]),
  },
  mounted() {
    //this.$nextTick();
    console.log("App.vue/mounted(): 1.");
    this.$store.state.loading = false;
  },
};
</script>
