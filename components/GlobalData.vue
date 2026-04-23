<template>
  <div>
    &nbsp; GlobalData reload
    <v-btn @click="actionFetchData({ path: 'members' })">Fetch data </v-btn>
    &nbsp; 
  </div>
</template>

<script>
import { mapActions } from "vuex";

export default {
  data: () => ({}),
  created: async function () {
    console.debug(`GlobalData.vue/mounted(): 1.`);
    //let loader = this.$loading.show();
    await this.$store.dispatch("actionLoadGlobalData");
    //await this.sleep(2000);
    await this.$store.dispatch("actionChangeSelectedFireRescueServiceId", {
      fireRescueServiceId: 1,
    });
    await this.$store.dispatch("actionChangeSelectedDate", {
      date: new Date().toISOString().substr(0, 10),
    });
    //loader.hide();
    console.debug(`GlobalData.vue/mounted(): 2.`);
  },
  methods: {
    sleep: function (ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    },
    ...mapActions(["actionLoadGlobalData", "actionX"]),
  },
};
</script>
