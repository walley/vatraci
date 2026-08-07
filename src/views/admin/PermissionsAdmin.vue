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
          <v-btn large color="blue" icon @click="loadPermissions()">
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
          <v-btn small color="purple" icon @click="openUsers(item)">
            <v-icon>mdi-account-multiple</v-icon>
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
          {{ dialog.action === "create" ? "Nové oprávnění" : "Oprávnění" }}
        </v-card-title>
        <v-form v-model="dialog.formValid">
          <v-card-text>
            <v-text-field
              v-model="dialog.form.name"
              :label="'Název'"
              :rules="[rules.required]"
              hide-details
              class="mb-4"
            ></v-text-field>
            <v-text-field
              v-model="dialog.form.code"
              :label="'Kód'"
              :rules="[rules.required]"
              hide-details
              class="mb-4"
            ></v-text-field>
            <v-text-field
              v-model="dialog.form.path"
              :label="'Cesta (path)'"
              hide-details
            ></v-text-field>
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

    <!-- Users with this permission dialog -->
    <v-dialog v-model="usersDialog.show" max-width="800" persistent>
      <v-card>
        <v-card-title class="headline">Uživatelé s tímto oprávněním</v-card-title>
        <v-card-title class="pt-0 d-flex align-center flex-wrap">
          <div class="d-flex align-center">
            <v-btn large color="red" icon :disabled="selectedUsers.length === 0" @click="removeManyUsers()">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
            <v-btn large color="green" icon :disabled="selectedUsers.length === 0" @click="addManyUsers()">
              <v-icon>mdi-plus</v-icon>
            </v-btn>
          </div>

          <v-spacer></v-spacer>

          <v-autocomplete
            :label="'Stav'"
            :items="userStatuses"
            v-model="usersDialog.selectedStatuses"
            single-line
            item-text="text"
            item-value="value"
            multiple
            chips
            style="width: 200px"
          ></v-autocomplete>

          <v-text-field
            v-model="usersDialog.search"
            :label="'Hledat'"
            append-icon="mdi-magnify"
            single-line
            hide-details
            style="width: 200px"
          ></v-text-field>
        </v-card-title>

        <v-data-table
          v-model="selectedUsers"
          :headers="usersHeaders"
          :items="filteredUsers"
          :no-results-text="'Záznam nebyl nalezen'"
          :no-data-text="'Data nejsou dostupná'"
          :items-per-page="10"
          :loading="usersDialog.loading"
          show-select
          multi-sort
          dense
        >
          <template v-slot:[`item.actions`]="{ item }">
            <v-btn
              v-if="item.added"
              small
              color="red"
              icon
              @click="removeUser(item)"
            >
              <v-icon>mdi-delete</v-icon>
            </v-btn>
            <v-btn
              v-else
              small
              color="green"
              icon
              @click="addUser(item)"
            >
              <v-icon>mdi-plus</v-icon>
            </v-btn>
          </template>
          <template v-slot:[`item.added`]="{ item }">
            <v-icon>{{ item.added ? "mdi-check" : "mdi-close" }}</v-icon>
          </template>
        </v-data-table>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey darken-3" text @click="usersDialog.show = false">Zavřít</v-btn>
        </v-card-actions>
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
  name: "PermissionsAdmin",
  data() {
    return {
      permissions: [],
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
      usersDialog: {
        show: false,
        permissionId: null,
        items: [],
        selectedStatuses: [1, 0],
        search: "",
        loading: false,
      },
      selectedUsers: [],
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
    userStatuses() {
      return [
        { text: "Přidáno", value: 1 },
        { text: "Nepřidáno", value: 0 },
      ];
    },
    headers() {
      return [
        { text: "Akce", value: "actions", sortable: false },
        { text: "Id", value: "id" },
        { text: "Název", value: "name" },
        { text: "Kód", value: "code" },
        { text: "Cesta", value: "path" },
        { text: "Stav", value: "active" },
      ];
    },
    usersHeaders() {
      return [
        { text: "Akce", value: "actions", sortable: false },
        { text: "Id", value: "id" },
        { text: "Uživatel", value: "name" },
        { text: "E-mail", value: "email" },
        { text: "Přidáno", value: "added" },
      ];
    },
    footerProps() {
      return {
        showFirstLastPage: true,
        rowsPerPageText: "Počet záznamů na stránku:",
        itemsPerPageOptions: [5, 10, 20, 50, 100],
      };
    },
    items() {
      return this.permissions.map((p) => ({
        id: p.id,
        name: p.name,
        code: p.code,
        path: p.path,
        active: p.active,
        _raw: p,
      }));
    },
    filteredItems() {
      let items = this.items.filter((item) =>
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
    usersItems() {
      return this.usersDialog.items.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        added: u.added,
        filterStatus: u.added ? 1 : 0,
        connectionId: u.connectionId,
      }));
    },
    filteredUsers() {
      const items = this.usersItems.filter((item) =>
        this.usersDialog.selectedStatuses.includes(item.filterStatus)
      );
      const phrases =
        this.usersDialog.search === "" ? [] : this.usersDialog.search.toLowerCase().split(" ");
      return items.filter((item) => {
        let found = true;
        for (let i = 0; i < phrases.length; i++) {
          found = false;
          for (const key in item) {
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
    this.loadPermissions();
  },
  methods: {
    // ## Messages
    showMessage(text, color) {
      this.snackbar = { show: true, text, color: color || "info" };
    },

    // ## API calls (same as version 1)
    loadPermissions() {
      this.loading = true;
      this.$http
        .get("crud/admin/permissions")
        .then(
          (response) => {
            this.permissions = response.body || [];
            this.loading = false;
          },
          (error) => {
            this.loading = false;
            this.showMessage(error.statusText || "Chyba při načítání oprávnění", "error");
          }
        );
    },
    loadPermission(id) {
      return this.$http.get(`crud/admin/permissions/${id}`);
    },
    createPermission(params) {
      return this.$http.post("crud/admin/permissions", params);
    },
    updatePermission(id, params) {
      return this.$http.put(`crud/admin/permissions/${id}`, params);
    },
    loadPermissionUsers(id) {
      return this.$http.get(`crud/admin/permissions/${id}/users`);
    },
    addUserPermission(params) {
      return this.$http.post("crud/admin/user-permissions", params);
    },
    removeUserPermission(id) {
      return this.$http.delete(`crud/admin/user-permissions/${id}`);
    },

    // ## Table actions
    create() {
      this.dialog = {
        show: true,
        action: "create",
        id: null,
        form: { name: "", code: "", path: "" },
        formValid: false,
      };
    },
    edit(item) {
      this.loadPermission(item.id).then(
        (response) => {
          const p = response.body;
          this.dialog = {
            show: true,
            action: "edit",
            id: p.id,
            form: {
              name: p.name,
              code: p.code,
              path: p.path,
            },
            formValid: false,
          };
        },
        (error) => {
          this.showMessage(error.statusText || "Chyba při načítání oprávnění", "error");
        }
      );
    },
    store() {
      this.createPermission({
        name: this.dialog.form.name,
        code: this.dialog.form.code,
        path: this.dialog.form.path,
      }).then(
        (response) => {
          if (response.body.status === 0) {
            this.showMessage("Oprávnění vytvořeno", "success");
            this.dialog.show = false;
            this.loadPermissions();
          } else {
            this.showMessage(response.body.msg || "Chyba při vytváření oprávnění", "error");
          }
        },
        (error) => {
          this.showMessage(error.statusText || "Chyba při vytváření oprávnění", "error");
        }
      );
    },
    update() {
      this.updatePermission(this.dialog.id, {
        name: this.dialog.form.name,
        code: this.dialog.form.code,
        path: this.dialog.form.path,
      }).then(
        (response) => {
          if (response.body.status === 0) {
            this.showMessage("Oprávnění upraveno", "success");
            this.dialog.show = false;
            this.loadPermissions();
          } else {
            this.showMessage(response.body.msg || "Chyba při úpravě oprávnění", "error");
          }
        },
        (error) => {
          this.showMessage(error.statusText || "Chyba při úpravě oprávnění", "error");
        }
      );
    },
    suspend(item) {
      this.updatePermission(item.id, { active: 0 }).then(
        (response) => {
          if (response.body.status === 0) {
            this.showMessage("Oprávnění suspendováno", "success");
            this.loadPermissions();
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
      this.updatePermission(item.id, { active: 1 }).then(
        (response) => {
          if (response.body.status === 0) {
            this.showMessage("Oprávnění obnoveno", "success");
            this.loadPermissions();
          } else {
            this.showMessage(response.body.msg || "Chyba při obnově", "error");
          }
        },
        (error) => {
          this.showMessage(error.statusText || "Chyba při obnově", "error");
        }
      );
    },
    suspendSelected() {
      const promises = this.selected.map((item) => this.updatePermission(item.id, { active: 0 }));
      Promise.all(promises).then(() => {
        this.showMessage("Vybraná oprávnění suspendována", "success");
        this.selected = [];
        this.loadPermissions();
      });
    },
    restoreSelected() {
      const promises = this.selected.map((item) => this.updatePermission(item.id, { active: 1 }));
      Promise.all(promises).then(() => {
        this.showMessage("Vybraná oprávnění obnovena", "success");
        this.selected = [];
        this.loadPermissions();
      });
    },
    clearFilters() {
      this.search = "";
      this.selectedStatuses = [1];
    },

    // ## Users dialog
    openUsers(item) {
      this.usersDialog.show = true;
      this.usersDialog.permissionId = item.id;
      this.usersDialog.search = "";
      this.usersDialog.selectedStatuses = [1, 0];
      this.selectedUsers.length = 0;
      this.loadUsers();
    },
    loadUsers() {
      this.usersDialog.loading = true;
      this.loadPermissionUsers(this.usersDialog.permissionId).then(
        (response) => {
          this.usersDialog.items = (response.body || []).map((u) => {
            const added = Array.isArray(u.UserPermissions) && u.UserPermissions.length > 0;
            return {
              id: u.id,
              name: u.name,
              email: u.email,
              added: added,
              connectionId: added ? u.UserPermissions[0].id : null,
            };
          });
          this.usersDialog.loading = false;
        },
        (error) => {
          this.usersDialog.loading = false;
          this.showMessage(error.statusText || "Chyba při načítání uživatelů", "error");
        }
      );
    },
    addUser(item) {
      this.addUserPermission({
        PermissionId: this.usersDialog.permissionId,
        UserId: item.id,
      }).then(
        () => {
          this.showMessage("Uživatel přidán", "success");
          this.loadUsers();
        },
        (error) => {
          this.showMessage(error.statusText || "Chyba při přidání uživatele", "error");
        }
      );
    },
    removeUser(item) {
      this.removeUserPermission(item.connectionId).then(
        () => {
          this.showMessage("Uživatel odebrán", "success");
          this.loadUsers();
        },
        (error) => {
          this.showMessage(error.statusText || "Chyba při odebrání uživatele", "error");
        }
      );
    },
    addManyUsers() {
      const notAdded = this.selectedUsers.filter((u) => !u.added);
      const promises = notAdded.map((u) =>
        this.addUserPermission({
          PermissionId: this.usersDialog.permissionId,
          UserId: u.id,
        })
      );
      Promise.all(promises).then(() => {
        this.showMessage("Uživatelé přidáni", "success");
        this.selectedUsers.length = 0;
        this.loadUsers();
      });
    },
    removeManyUsers() {
      const added = this.selectedUsers.filter((u) => u.added);
      const promises = added.map((u) => this.removeUserPermission(u.connectionId));
      Promise.all(promises).then(() => {
        this.showMessage("Uživatelé odebráni", "success");
        this.selectedUsers.length = 0;
        this.loadUsers();
      });
    },
  },
};
</script>
