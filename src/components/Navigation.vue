<template>
  <v-navigation-drawer v-model="$store.state.stateNavigationDisplayed" app width="360">
 
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
        <v-btn icon @click="collapseDrawer">
          <v-icon>mdi-chevron-left</v-icon>
        </v-btn>
      </div>
    </v-sheet>

    <v-divider gradient class="text-red" thickness="3"></v-divider>

    <v-list dense nav>
      <template v-for="item in visibleItems">
        <v-list-item
          v-if="!item.children"
          :key="item.title"
          class="link"
          :to="item.route"
        >
          <v-list-item-icon>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-group
          v-else
          :key="item.title"
          :prepend-icon="item.icon"
          append-icon=""
        >
          <template v-slot:activator>
            <v-list-item-content>
              <v-list-item-title>{{ item.title }}</v-list-item-title>
            </v-list-item-content>
          </template>

          <v-list-item
            v-for="child in item.children"
            :key="child.title"
            class="link pl-10"
            :to="child.route"
          >
            <v-list-item-icon>
              <v-icon>{{ child.icon }}</v-icon>
            </v-list-item-icon>

            <v-list-item-content>
              <v-list-item-title>{{ child.title }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-group>
      </template>
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
    collapseDrawer() {
      this.$store.commit("mutationSetDrawer", { drawer: false });
    },
    async logout() {
      if (confirm("Opravdu chcete odhlásit?")) {
        await this.$store.dispatch("auth/logout");
        this.$router.push("/logout");
      }
    },
    checkVisible(item) {
      if (!item.guard) return true;
      const permissions = this.$store.state.auth.permissions || [];
      if (!permissions.length) return true;
      return permissions.includes(item.guard);
    },
  },
  props: {},
  data() {
    return {
      items: [
        { title: "Plánovač", icon: "mdi-view-dashboard", route: "/planner" },
        { title: "Rozkaz", icon: "mdi-image", route: "/order" },
        {
          title: "FAD",
          icon: "mdi-fire",
          guard: "FAD",
          route: "/fad",
          children: [
            { title: "Plánovač nepřítomnosti", icon: "mdi-calendar-month", route: "/fad/planner" },
            { title: "Denní rozkaz", icon: "mdi-image", route: "/fad/order" },
            { title: "Poznámky k rozkazu", icon: "mdi-note-text", route: "/fad/order-notes" },
            { title: "Plánovač - RAW", icon: "mdi-calendar-clock", route: "/fad/planner-raw" },
            { title: "Hasičské záchranné sbory", icon: "mdi-fire-truck", route: "/fad/fire-rescue-services" },
            { title: "Územní odbory", icon: "mdi-map-marker", route: "/fad/territorial-districts" },
            { title: "Požární stanice", icon: "mdi-home-city", route: "/fad/fire-stations" },
            { title: "Směny", icon: "mdi-calendar-refresh", route: "/fad/shifts" },
            { title: "Nastavení požární stanice", icon: "mdi-cog", route: "/fad/fire-station-settings" },
            { title: "Výjezdy", icon: "mdi-truck", route: "/fad/crews" },
            { title: "Obsazení výjezdů", icon: "mdi-account-group", route: "/fad/positions" },
            { title: "Odbornosti", icon: "mdi-school", route: "/fad/specializations" },
            { title: "Příslušníci", icon: "mdi-account", route: "/fad/members" },
            { title: "Specializace příslušníků", icon: "mdi-badge-account-horizontal", route: "/fad/member-specializations" },
            { title: "Nárok dovolené", icon: "mdi-beach", route: "/fad/vacations" },
            { title: "Logy FAD", icon: "mdi-list-box", route: "/fad/fad-logs" },
          ],
        },
        {
          title: "FAD Oprávnění",
          icon: "mdi-shield-account",
          guard: "FAD-PERMISSIONS",
          route: "/fad",
          children: [
            { title: "FAD Oprávnění", icon: "mdi-shield-key", route: "/fad/fad-permissions" },
            { title: "Oprávnění FAD uživatele", icon: "mdi-account-key", route: "/fad/user-fad-permissions" },
            { title: "FAD Oprávnění - Požární stanice", icon: "mdi-home-shield", route: "/fad/fire-station-fad-permissions" },
            { title: "FAD Oprávnění - Směny", icon: "mdi-shield-alert", route: "/fad/shift-fad-permissions" },
          ],
        },
        {
          title: "Administrace",
          icon: "mdi-account-cog",
          guard: "ADMIN",
          route: "/administration",
          children: [
            { title: "Uživatelé", icon: "mdi-account-multiple", route: "/administration/users" },
            { title: "Oprávnění", icon: "mdi-key", route: "/administration/permissions" },
            { title: "Uživatelská oprávnění", icon: "mdi-account-key", route: "/administration/user-permissions" },
            { title: "Typy uživatelů", icon: "mdi-account-tag", route: "/administration/user-types" },
          ],
        },
        { title: "O aplikaci", icon: "mdi-help-box", route: "/about" },
      ],
      right: null,
    };
  },
  computed: {
    visibleItems() {
      return this.items.filter((item) => this.checkVisible(item));
    },
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
