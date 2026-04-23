<template>
  <v-navigation-drawer v-model="$store.state.stateNavigationDisplayed" app>
 
    <!-- User Info Header -->
    <v-sheet color="primary" dark class="pa-4">
      <div class="d-flex align-center">
        <v-avatar size="56" class="mr-3">
          <v-icon size="32">mdi-account-circle</v-icon>
        </v-avatar>
        <div class="flex-grow-1">
          <div class="text-subtitle-1 font-weight-medium">
            {{ userName }}
          </div>
          <div class="text-caption opacity-80">
            {{ userEmail }}
          </div>
        </div>
      </div>
    </v-sheet>

    <v-divider gradient class="text-red" thickness="3"></v-divider>

    <v-list dense nav>
      <v-list-item v-for="item in items" :key="item.title" class="link">
        <v-list-item-icon>
          <v-icon>{{ item.icon }}</v-icon>
        </v-list-item-icon>

        <v-list-item-content>
          <v-list-item-title
            ><router-link :to="item.route">{{
              item.title
            }}</router-link></v-list-item-title
          >
        </v-list-item-content>
      </v-list-item>
    </v-list>

    <v-divider gradient class="color:red;" thickness="3"></v-divider>

    <v-list-item @click="logout" class="mt-auto">
      <v-list-item-icon>
        <v-icon color="error">mdi-logout</v-icon>
      </v-list-item-icon>
      <v-list-item-content>
        <v-list-item-title>Odhlásit se</v-list-item-title>
      </v-list-item-content>
    </v-list-item>

  </v-navigation-drawer>
</template>

<script>
export default {
  methods: {
    async logout() {
      if (confirm("Opravdu chcete odhlásit?")) {
        await this.$store.dispatch("auth/logout");
      }
    }
  },
  props: {},
  data() {
    return {
      items: [
        { title: "Plánovač", icon: "mdi-view-dashboard", route: "/planner" },
        { title: "Rozkaz", icon: "mdi-image", route: "/order" },
        { title: "O aplikaci", icon: "mdi-help-box", route: "/about" },
      ],
      right: null,
    };
  },
  computed: {
    userName() {
      var user = this.$store.getters["auth/user"];
      var name;
      if (user?.name != null) {
        name = user.name;
      } else {
        //JSON.parse("stored:" + localStorage.getItem('user'))?.name || "No name";
        name = "No name";
      }
      return name;
    },
    userEmail() {
      //return this.$store.getters["auth/user"]?.email || "";
      return "id: " + this.$store.getters["auth/id"];
    }
  }
};
</script>
