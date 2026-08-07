<template>
  <v-container fluid>
    <v-card flat>
      <!-- Table controls -->
      <v-card-title class="px-3 d-flex align-center justify-space-between flex-wrap">
        <div class="d-flex align-center">
          <v-btn x-large color="light-blue lighten-2" icon @click="create()">
            <v-icon>mdi-plus</v-icon>
          </v-btn>
          <v-btn large color="grey darken-3" icon :disabled="selected.length === 0" @click="destroySelected()">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </div>

        <div class="d-flex align-center">
          <v-text-field
            class="mr-3"
            append-icon="mdi-magnify"
            label="Hledat"
            single-line
            hide-details
            v-model="search"
            style="width: 250px"
          ></v-text-field>
          <v-btn large color="grey" icon @click="clearFilters()">
            <v-icon>mdi-filter-remove</v-icon>
          </v-btn>
        </div>

        <div>
          <v-btn large color="blue" icon @click="loadItems()">
            <v-icon>mdi-refresh</v-icon>
          </v-btn>
        </div>
      </v-card-title>

      <!-- Table -->
      <v-data-table
        v-model="selected"
        :headers="headers"
        :items="filteredItems"
        item-key="id"
        :no-results-text="'Záznam nebyl nalezen'"
        :no-data-text="'Data nejsou dostupná'"
        :footer-props="footerProps"
        :items-per-page="20"
        :loading="loading"
        show-select
        multi-sort
        dense
      >
        <template v-slot:[`item.actions`]="{ item }">
          <v-btn small color="orange" icon @click="edit(item)">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn small color="grey darken-3" icon @click="destroy(item)">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Create / edit dialog -->
    <v-dialog v-model="dialog.show" max-width="600" persistent>
      <v-card>
        <v-card-title class="headline">
          {{ dialog.action === "create" ? "Nové uživatelské oprávnění" : "Uživatelské oprávnění" }}
        </v-card-title>
        <v-form v-model="dialog.formValid">
          <v-card-text>
            <v-autocomplete
              v-model="dialog.form.UserId"
              :items="users"
              :loading="usersLoading"
              item-text="name"
              item-value="id"
              :label="'Uživatel'"
              :rules="[rules.required]"
              hide-details
              menu-props="bottom"
              class="mb-4"
            ></v-autocomplete>
            <v-autocomplete
              v-model="dialog.form.PermissionId"
              :items="permissions"
              :loading="permissionsLoading"
              item-text="name"
              item-value="id"
              :label="'Oprávnění'"
              :rules="[rules.required]"
              hide-details
              menu-props="bottom"
            ></v-autocomplete>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="grey darken-3" text @click="dialog.show = false">Zavřít</v-btn>
            <v-btn
              :disabled="!dialog.formValid"
              v-if="dialog.action === 'create'"
              color="green"
              text
              @click="store()"
            >Vytvořit</v-btn>
            <v-btn
              :disabled="!dialog.formValid"
              v-else-if="dialog.action === 'edit'"
              color="orange"
              text
              @click="update()"
            >Upravit</v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>

    <!-- Messages -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
      {{ snackbar.text }}
    </v-snackbar>
  </v-container>
</template>

<script>
export default {
  name: "UserPermissionsAdmin",
  data() {
    return {
      items: [],
      users: [],
      usersLoading: false,
      permissions: [],
      permissionsLoading: false,
      loading: true,
      search: "",
      selected: [],
      dialog: {
        show: false,
        action: "create",
        id: null,
        form: {},
        formValid: false,
      },
      snackbar: {
        show: false,
        text: "",
        color: "info",
      },
    };
  },
  computed: {
    rules() {
      return {
        required: (v) => !!v || "Povinné pole",
      };
    },
    headers() {
      return [
        { text: "Akce", value: "actions", sortable: false },
        { text: "Id", value: "id" },
        { text: "Uživatel", value: "user" },
        { text: "E-mail uživatele", value: "userEmail" },
        { text: "Oprávnění", value: "permission" },
      ];
    },
    footerProps() {
      return {
        showFirstLastPage: true,
        rowsPerPageText: "Počet záznamů na stránku:",
        itemsPerPageOptions: [5, 10, 20, 50, 100],
      };
    },
    mappedItems() {
      return this.items.map((r) => ({
        id: r.id,
        UserId: r.UserId,
        PermissionId: r.PermissionId,
        user: r.User ? r.User.name : "-",
        userEmail: r.User ? r.User.email : "-",
        permission: r.Permission ? r.Permission.name : "-",
        _raw: r,
      }));
    },
    filteredItems() {
      const phrases = this.search === "" ? [] : this.search.toLowerCase().split(" ");
      return this.mappedItems.filter((item) => {
        let found = true;
        for (let i = 0; i < phrases.length; i++) {
          found = false;
          for (const key in item) {
            if (key === "_raw") continue;
            let field = item[key];
            if (typeof field === "string" || typeof field === "number") {
              field = field.toString().toLowerCase();
              if (field.includes(phrases[i])) {
                found = true;
              }
            }
          }
          if (!found) break;
        }
        return found;
      });
    },
  },
  created() {
    this.loadItems();
    this.loadUsers();
    this.loadPermissions();
  },
  methods: {
    // ## Messages
    showMessage(text, color) {
      this.snackbar = { show: true, text, color: color || "info" };
    },

    // ## API calls (same as version 1)
    loadItems() {
      this.loading = true;
      this.$http
        .get("crud/admin/user-permissions")
        .then(
          (response) => {
            this.items = response.body || [];
            this.loading = false;
          },
          (error) => {
            this.loading = false;
            this.showMessage(error.statusText || "Chyba při načítání uživatelských oprávnění", "error");
          }
        );
    },
    loadUsers() {
      this.usersLoading = true;
      this.$http
        .get("crud/admin/users")
        .then(
          (response) => {
            this.users = response.body || [];
            this.usersLoading = false;
          },
          (error) => {
            this.usersLoading = false;
            this.showMessage(error.statusText || "Chyba při načítání uživatelů", "error");
          }
        );
    },
    loadPermissions() {
      this.permissionsLoading = true;
      this.$http
        .get("crud/admin/permissions")
        .then(
          (response) => {
            this.permissions = response.body || [];
            this.permissionsLoading = false;
          },
          (error) => {
            this.permissionsLoading = false;
            this.showMessage(error.statusText || "Chyba při načítání oprávnění", "error");
          }
        );
    },
    loadItem(id) {
      return this.$http.get(`crud/admin/user-permissions/${id}`);
    },
    createItem(params) {
      return this.$http.post("crud/admin/user-permissions", params);
    },
    updateItem(id, params) {
      return this.$http.put(`crud/admin/user-permissions/${id}`, params);
    },
    destroyItem(id) {
      return this.$http.delete(`crud/admin/user-permissions/${id}`);
    },

    // ## Table actions
    create() {
      this.dialog = {
        show: true,
        action: "create",
        id: null,
        form: { UserId: null, PermissionId: null },
        formValid: false,
      };
    },
    edit(item) {
      this.loadItem(item.id).then(
        (response) => {
          const r = response.body;
          this.dialog = {
            show: true,
            action: "edit",
            id: r.id,
            form: {
              UserId: r.UserId,
              PermissionId: r.PermissionId,
            },
            formValid: false,
          };
        },
        (error) => {
          this.showMessage(error.statusText || "Chyba při načítání uživatelského oprávnění", "error");
        }
      );
    },
    store() {
      this.createItem({
        UserId: this.dialog.form.UserId,
        PermissionId: this.dialog.form.PermissionId,
      }).then(
        (response) => {
          if (response.body.status === 0) {
            this.showMessage("Uživatelské oprávnění vytvořeno", "success");
            this.dialog.show = false;
            this.loadItems();
          } else {
            this.showMessage(response.body.msg || "Chyba při vytváření uživatelského oprávnění", "error");
          }
        },
        (error) => {
          this.showMessage(error.statusText || "Chyba při vytváření uživatelského oprávnění", "error");
        }
      );
    },
    update() {
      this.updateItem(this.dialog.id, {
        UserId: this.dialog.form.UserId,
        PermissionId: this.dialog.form.PermissionId,
      }).then(
        (response) => {
          if (response.body.status === 0) {
            this.showMessage("Uživatelské oprávnění upraveno", "success");
            this.dialog.show = false;
            this.loadItems();
          } else {
            this.showMessage(response.body.msg || "Chyba při úpravě uživatelského oprávnění", "error");
          }
        },
        (error) => {
          this.showMessage(error.statusText || "Chyba při úpravě uživatelského oprávnění", "error");
        }
      );
    },
    destroy(item) {
      if (!confirm("Opravdu chcete odstranit toto uživatelské oprávnění?")) return;
      this.destroyItem(item.id).then(
        () => {
          this.showMessage("Uživatelské oprávnění odstraněno", "success");
          this.loadItems();
        },
        (error) => {
          this.showMessage(error.statusText || "Chyba při odstraňování uživatelského oprávnění", "error");
        }
      );
    },
    destroySelected() {
      if (!confirm("Opravdu chcete odstranit vybraná uživatelská oprávnění?")) return;
      const promises = this.selected.map((item) => this.destroyItem(item.id));
      Promise.all(promises).then(() => {
        this.showMessage("Vybraná uživatelská oprávnění odstraněna", "success");
        this.selected = [];
        this.loadItems();
      });
    },
    clearFilters() {
      this.search = "";
    },
  },
};
</script>
