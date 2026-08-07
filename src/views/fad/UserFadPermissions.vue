<template>
  <v-container fluid>
    <v-card flat>
      <!-- Table controls -->
      <v-card-title class="px-3 d-flex align-center justify-space-between flex-wrap">
        <div class="d-flex align-center">
          <v-btn x-large color="light-blue lighten-2" icon @click="create()">
            <v-icon>mdi-plus</v-icon>
          </v-btn>
          <v-btn large color="red" icon :disabled="selected.length === 0" @click="suspendSelected()">
            <v-icon>mdi-undo</v-icon>
          </v-btn>
          <v-btn large color="green" icon :disabled="selected.length === 0" @click="restoreSelected()">
            <v-icon>mdi-redo</v-icon>
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
          <v-autocomplete
            :label="'Stavy'"
            :items="statuses"
            v-model="selectedStatuses"
            single-line
            item-text="text"
            item-value="value"
            multiple
            chips
            style="width: 250px"
          ></v-autocomplete>
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
          <v-btn
            v-if="item.active == '1'"
            small
            color="red"
            icon
            @click="suspend(item)"
          >
            <v-icon>mdi-undo</v-icon>
          </v-btn>
          <v-btn
            v-else
            small
            color="green"
            icon
            @click="restore(item)"
          >
            <v-icon>mdi-redo</v-icon>
          </v-btn>
          <v-btn small color="grey darken-3" icon @click="destroy(item)">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
        <template v-slot:[`item.active`]="{ item }">
          <v-chip small :color="item.active == '1' ? 'green' : 'red'" text-color="white">
            {{ item.active == "1" ? "Aktivní" : "Neaktivní" }}
          </v-chip>
        </template>
      </v-data-table>
    </v-card>

    <!-- Create / edit dialog -->
    <v-dialog v-model="dialog.show" max-width="600" persistent>
      <v-card>
        <v-card-title class="headline">
          {{ dialog.action === "create" ? "Nové oprávnění FAD uživatele" : "Oprávnění FAD uživatele" }}
        </v-card-title>
        <v-form v-model="dialog.formValid">
          <v-card-text>
            <v-autocomplete
              v-model="dialog.form.UserId"
              :items="userOptions"
              :loading="usersLoading"
              :label="'Uživatel'"
              :rules="[rules.required]"
              hide-details
              menu-props="bottom"
              clearable
              class="mb-4"
            ></v-autocomplete>
            <v-autocomplete
              v-model="dialog.form.FadPermissionId"
              :items="permissionOptions"
              :loading="permissionsLoading"
              :label="'Oprávnění'"
              :rules="[rules.required]"
              hide-details
              menu-props="bottom"
              clearable
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
  name: "UserFadPermissions",
  data() {
    return {
      items: [],
      users: [],
      usersLoading: false,
      permissions: [],
      permissionsLoading: false,
      loading: true,
      search: "",
      selectedStatuses: [1],
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
    statuses() {
      return [
        { text: "Aktivní", value: 1 },
        { text: "Neaktivní", value: 0 },
      ];
    },
    userOptions() {
      return this.users.map((u) => ({ value: u.id, text: u.email }));
    },
    permissionOptions() {
      return this.permissions.map((p) => ({ value: p.id, text: p.name }));
    },
    headers() {
      return [
        { text: "Akce", value: "actions", sortable: false },
        { text: "Id", value: "id" },
        { text: "Uživatel", value: "user" },
        { text: "Oprávnění", value: "permission" },
        { text: "Stav", value: "active" },
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
        active: r.active,
        user: r.User ? r.User.email : "-",
        permission: r.FadPermission ? r.FadPermission.name : "-",
        _raw: r,
      }));
    },
    filteredItems() {
      let items = this.mappedItems.filter((item) =>
        this.selectedStatuses.includes(parseInt(item.active))
      );
      const phrases = this.search === "" ? [] : this.search.toLowerCase().split(" ");
      items = items.filter((item) => {
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
      return items;
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
        .get("crud/fad/user-fad-permissions")
        .then(
          (response) => {
            this.items = response.body || [];
            this.loading = false;
          },
          (error) => {
            this.loading = false;
            this.showMessage(error.statusText || "Chyba při načítání oprávnění uživatelů", "error");
          }
        );
    },
    loadUsers() {
      this.usersLoading = true;
      this.$http
        .get("crud/admin/users")
        .then(
          (response) => {
            this.users = (response.body || []).filter((u) => u.active == 1);
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
        .get("crud/fad/fad-permissions")
        .then(
          (response) => {
            this.permissions = (response.body || []).filter((p) => p.active == 1);
            this.permissionsLoading = false;
          },
          (error) => {
            this.permissionsLoading = false;
            this.showMessage(error.statusText || "Chyba při načítání FAD oprávnění", "error");
          }
        );
    },
    loadItem(id) {
      return this.$http.get(`crud/fad/user-fad-permissions/${id}`);
    },
    createItem(params) {
      return this.$http.post("crud/fad/user-fad-permissions", params);
    },
    updateItem(id, params) {
      return this.$http.put(`crud/fad/user-fad-permissions/${id}`, params);
    },
    destroyItem(id) {
      return this.$http.delete(`crud/fad/user-fad-permissions/${id}`);
    },

    // ## Table actions
    create() {
      this.dialog = {
        show: true,
        action: "create",
        id: null,
        form: {
          UserId: null,
          FadPermissionId: null,
        },
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
              FadPermissionId: r.FadPermissionId,
            },
            formValid: false,
          };
        },
        (error) => {
          this.showMessage(error.statusText || "Chyba při načítání záznamu", "error");
        }
      );
    },
    store() {
      this.createItem({
        UserId: this.dialog.form.UserId,
        FadPermissionId: this.dialog.form.FadPermissionId,
      }).then(
        (response) => {
          if (response.body.status === 0) {
            this.showMessage("Oprávnění uživatele vytvořeno", "success");
            this.dialog.show = false;
            this.loadItems();
          } else {
            this.showMessage(response.body.msg || "Chyba při vytváření záznamu", "error");
          }
        },
        (error) => {
          this.showMessage(error.statusText || "Chyba při vytváření záznamu", "error");
        }
      );
    },
    update() {
      this.updateItem(this.dialog.id, {
        UserId: this.dialog.form.UserId,
        FadPermissionId: this.dialog.form.FadPermissionId,
      }).then(
        (response) => {
          if (response.body.status === 0) {
            this.showMessage("Oprávnění uživatele upraveno", "success");
            this.dialog.show = false;
            this.loadItems();
          } else {
            this.showMessage(response.body.msg || "Chyba při úpravě záznamu", "error");
          }
        },
        (error) => {
          this.showMessage(error.statusText || "Chyba při úpravě záznamu", "error");
        }
      );
    },
    suspend(item) {
      this.updateItem(item.id, { active: 0 }).then(
        (response) => {
          if (response.body.status === 0) {
            this.showMessage("Oprávnění suspendováno", "success");
            this.loadItems();
          } else {
            this.showMessage(response.body.msg || "Chyba při suspendaci", "error");
          }
        },
        (error) => {
          this.showMessage(error.statusText || "Chyba při suspendaci", "error");
        }
      );
    },
    restore(item) {
      this.updateItem(item.id, { active: 1 }).then(
        (response) => {
          if (response.body.status === 0) {
            this.showMessage("Oprávnění obnoveno", "success");
            this.loadItems();
          } else {
            this.showMessage(response.body.msg || "Chyba při obnově", "error");
          }
        },
        (error) => {
          this.showMessage(error.statusText || "Chyba při obnově", "error");
        }
      );
    },
    destroy(item) {
      if (!confirm("Opravdu chcete trvale odstranit tento záznam?")) return;
      this.destroyItem(item.id).then(
        () => {
          this.showMessage("Záznam trvale odstraněn", "success");
          this.loadItems();
        },
        (error) => {
          this.showMessage(error.statusText || "Chyba při odstraňování záznamu", "error");
        }
      );
    },
    suspendSelected() {
      const promises = this.selected.map((item) => this.updateItem(item.id, { active: 0 }));
      Promise.all(promises).then(() => {
        this.showMessage("Vybraná oprávnění suspendována", "success");
        this.selected = [];
        this.loadItems();
      });
    },
    restoreSelected() {
      const promises = this.selected.map((item) => this.updateItem(item.id, { active: 1 }));
      Promise.all(promises).then(() => {
        this.showMessage("Vybraná oprávnění obnovena", "success");
        this.selected = [];
        this.loadItems();
      });
    },
    destroySelected() {
      if (!confirm("Opravdu chcete trvale odstranit vybrané záznamy?")) return;
      const promises = this.selected.map((item) => this.destroyItem(item.id));
      Promise.all(promises).then(() => {
        this.showMessage("Vybrané záznamy trvale odstraněny", "success");
        this.selected = [];
        this.loadItems();
      });
    },
    clearFilters() {
      this.search = "";
      this.selectedStatuses = [1];
    },
  },
};
</script>
