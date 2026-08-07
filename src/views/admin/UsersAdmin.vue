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
          <v-btn large color="blue" icon @click="loadUsers()">
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
          <v-btn small color="blue" icon @click="resetPassword(item)">
            <v-icon>mdi-lock-reset</v-icon>
          </v-btn>
          <v-btn small color="purple" icon @click="openPermissions(item)">
            <v-icon>mdi-lock-open</v-icon>
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
      </v-data-table>
    </v-card>

    <!-- Create / edit dialog -->
    <v-dialog v-model="dialog.show" max-width="600" persistent>
      <v-card>
        <v-card-title class="headline">
          {{ dialog.action === "create" ? "Nový uživatel" : "Uživatel" }}
        </v-card-title>
        <v-form v-model="dialog.formValid">
          <v-card-text>
            <v-text-field
              v-model="dialog.form.name"
              :label="'Jméno'"
              :rules="[rules.required]"
              hide-details
              class="mb-4"
            ></v-text-field>
            <v-text-field
              v-model="dialog.form.email"
              :label="'E-mail'"
              :rules="[rules.required]"
              hide-details
              class="mb-4"
            ></v-text-field>
            <v-autocomplete
              v-model="dialog.form.UserTypeId"
              :items="userTypes"
              :loading="userTypesLoading"
              item-text="name"
              item-value="id"
              :label="'Typ uživatele'"
              :rules="[rules.required]"
              hide-details
              menu-props="bottom"
              class="mb-4"
            ></v-autocomplete>
            <v-text-field
              v-if="dialog.action === 'edit'"
              v-model="dialog.form.initialPassword"
              :label="'Iniciální heslo'"
              disabled
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

    <!-- User permissions dialog -->
    <v-dialog v-model="permissionsDialog.show" max-width="800" persistent>
      <v-card>
        <v-card-title class="headline">Uživatelská oprávnění</v-card-title>
        <v-card-title class="pt-0 d-flex align-center flex-wrap">
          <div class="d-flex align-center">
            <v-btn large color="red" icon :disabled="selectedPermissions.length === 0" @click="removeManyPermissions()">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
            <v-btn large color="green" icon :disabled="selectedPermissions.length === 0" @click="addManyPermissions()">
              <v-icon>mdi-plus</v-icon>
            </v-btn>
          </div>

          <v-spacer></v-spacer>

          <v-autocomplete
            :label="'Stav'"
            :items="permissionStatuses"
            v-model="permissionsDialog.selectedStatuses"
            single-line
            item-text="text"
            item-value="value"
            multiple
            chips
            style="width: 200px"
          ></v-autocomplete>

          <v-text-field
            v-model="permissionsDialog.search"
            :label="'Hledat'"
            append-icon="mdi-magnify"
            single-line
            hide-details
            style="width: 200px"
          ></v-text-field>
        </v-card-title>

        <v-data-table
          v-model="selectedPermissions"
          :headers="permissionsHeaders"
          :items="filteredPermissions"
          :no-results-text="'Záznam nebyl nalezen'"
          :no-data-text="'Data nejsou dostupná'"
          :items-per-page="10"
          :loading="permissionsDialog.loading"
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
              @click="removePermission(item)"
            >
              <v-icon>mdi-delete</v-icon>
            </v-btn>
            <v-btn
              v-else
              small
              color="green"
              icon
              @click="addPermission(item)"
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
          <v-btn color="grey darken-3" text @click="permissionsDialog.show = false">Zavřít</v-btn>
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
  name: "UsersAdmin",
  data() {
    return {
      users: [],
      userTypes: [],
      userTypesLoading: false,
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
      permissionsDialog: {
        show: false,
        userId: null,
        items: [],
        selectedStatuses: [1, 0],
        search: "",
        loading: false,
      },
      selectedPermissions: [],
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
    permissionStatuses() {
      return [
        { text: "Přidáno", value: 1 },
        { text: "Nepřidáno", value: 0 },
      ];
    },
    headers() {
      return [
        { text: "Akce", value: "actions", sortable: false },
        { text: "Id", value: "id" },
        { text: "Jméno", value: "name" },
        { text: "E-mail", value: "email" },
        { text: "Typ uživatele", value: "usertype" },
      ];
    },
    permissionsHeaders() {
      return [
        { text: "Akce", value: "actions", sortable: false },
        { text: "Oprávnění", value: "name" },
        { text: "Kód", value: "code" },
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
      return this.users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        active: u.active,
        usertype: u.UserType ? u.UserType.name : "-",
        _raw: u,
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
            if (
              typeof field === "string" ||
              typeof field === "number"
            ) {
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
    permissionsItems() {
      return this.permissionsDialog.items.map((p) => ({
        id: p.id,
        name: p.name,
        code: p.code,
        added: p.added,
        filterStatus: p.added ? 1 : 0,
        connectionId: p.connectionId,
      }));
    },
    filteredPermissions() {
      const items = this.permissionsItems.filter((item) =>
        this.permissionsDialog.selectedStatuses.includes(item.filterStatus)
      );
      const phrases =
        this.permissionsDialog.search === ""
          ? []
          : this.permissionsDialog.search.toLowerCase().split(" ");
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
    this.loadUsers();
    this.loadUserTypes();
  },
  methods: {
    // ## Messages
    showMessage(text, color) {
      this.snackbar = { show: true, text, color: color || "info" };
    },

    // ## API calls (same as version 1)
    loadUsers() {
      this.loading = true;
      this.$http
        .get("crud/admin/users")
        .then(
          (response) => {
            this.users = response.body || [];
            this.loading = false;
          },
          (error) => {
            this.loading = false;
            this.showMessage(error.statusText || "Chyba při načítání uživatelů", "error");
          }
        );
    },
    loadUserTypes() {
      this.userTypesLoading = true;
      this.$http
        .get("crud/admin/user-types")
        .then(
          (response) => {
            this.userTypes = response.body || [];
            this.userTypesLoading = false;
          },
          (error) => {
            this.userTypesLoading = false;
            this.showMessage(error.statusText || "Chyba při načítání typů uživatelů", "error");
          }
        );
    },
    loadUser(id) {
      return this.$http.get(`crud/admin/users/${id}`);
    },
    createUser(params) {
      return this.$http.post("crud/admin/users", params);
    },
    updateUser(id, params) {
      return this.$http.put(`crud/admin/users/${id}`, params);
    },
    resetUserPassword(id) {
      return this.$http.put(`admin/users/${id}/reset-password`);
    },
    loadUserPermissions(id) {
      return this.$http.get(`crud/admin/users/${id}/Permissions`);
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
        form: { name: "", email: "", UserTypeId: null },
        formValid: false,
      };
    },
    edit(item) {
      this.loadUser(item.id).then(
        (response) => {
          const u = response.body;
          this.dialog = {
            show: true,
            action: "edit",
            id: u.id,
            form: {
              name: u.name,
              email: u.email,
              UserTypeId: u.UserTypeId,
              initialPassword: u.initialPassword,
            },
            formValid: false,
          };
        },
        (error) => {
          this.showMessage(error.statusText || "Chyba při načítání uživatele", "error");
        }
      );
    },
    store() {
      this.createUser({
        name: this.dialog.form.name,
        email: this.dialog.form.email,
        UserTypeId: this.dialog.form.UserTypeId,
      }).then(
        (response) => {
          if (response.body.status === 0) {
            this.showMessage("Uživatel vytvořen", "success");
            this.dialog.show = false;
            this.loadUsers();
          } else {
            this.showMessage(response.body.msg || "Chyba při vytváření uživatele", "error");
          }
        },
        (error) => {
          this.showMessage(error.statusText || "Chyba při vytváření uživatele", "error");
        }
      );
    },
    update() {
      this.updateUser(this.dialog.id, {
        name: this.dialog.form.name,
        email: this.dialog.form.email,
        UserTypeId: this.dialog.form.UserTypeId,
        initialPassword: this.dialog.form.initialPassword,
      }).then(
        (response) => {
          if (response.body.status === 0) {
            this.showMessage("Uživatel upraven", "success");
            this.dialog.show = false;
            this.loadUsers();
          } else {
            this.showMessage(response.body.msg || "Chyba při úpravě uživatele", "error");
          }
        },
        (error) => {
          this.showMessage(error.statusText || "Chyba při úpravě uživatele", "error");
        }
      );
    },
    suspend(item) {
      this.updateUser(item.id, { active: 0 }).then(
        (response) => {
          if (response.body.status === 0) {
            this.showMessage("Uživatel suspendován", "success");
            this.loadUsers();
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
      this.updateUser(item.id, { active: 1 }).then(
        (response) => {
          if (response.body.status === 0) {
            this.showMessage("Uživatel obnoven", "success");
            this.loadUsers();
          } else {
            this.showMessage(response.body.msg || "Chyba při obnově", "error");
          }
        },
        (error) => {
          this.showMessage(error.statusText || "Chyba při obnově", "error");
        }
      );
    },
    resetPassword(item) {
      this.resetUserPassword(item.id).then(
        (response) => {
          this.showMessage("Heslo změněno", "success");
          this.loadUsers();
        },
        (error) => {
          this.showMessage(error.statusText || "Chyba! Změna hesla nebyla úspěšná", "error");
        }
      );
    },
    suspendSelected() {
      const promises = this.selected.map((item) => this.updateUser(item.id, { active: 0 }));
      Promise.all(promises).then(() => {
        this.showMessage("Vybraní uživatelé suspendováni", "success");
        this.selected = [];
        this.loadUsers();
      });
    },
    restoreSelected() {
      const promises = this.selected.map((item) => this.updateUser(item.id, { active: 1 }));
      Promise.all(promises).then(() => {
        this.showMessage("Vybraní uživatelé obnoveni", "success");
        this.selected = [];
        this.loadUsers();
      });
    },
    clearFilters() {
      this.search = "";
      this.selectedStatuses = [1];
    },

    // ## Permissions dialog
    openPermissions(item) {
      this.permissionsDialog.show = true;
      this.permissionsDialog.userId = item.id;
      this.permissionsDialog.search = "";
      this.permissionsDialog.selectedStatuses = [1, 0];
      this.selectedPermissions.length = 0;
      this.loadPermissions();
    },
    loadPermissions() {
      this.permissionsDialog.loading = true;
      this.loadUserPermissions(this.permissionsDialog.userId).then(
        (response) => {
          this.permissionsDialog.items = (response.body || []).map((p) => {
            const added = Array.isArray(p.UserPermissions) && p.UserPermissions.length > 0;
            return {
              id: p.id,
              name: p.name,
              code: p.code,
              added: added,
              connectionId: added ? p.UserPermissions[0].id : null,
            };
          });
          this.permissionsDialog.loading = false;
        },
        (error) => {
          this.permissionsDialog.loading = false;
          this.showMessage(error.statusText || "Chyba při načítání oprávnění", "error");
        }
      );
    },
    addPermission(item) {
      this.addUserPermission({
        UserId: this.permissionsDialog.userId,
        PermissionId: item.id,
      }).then(
        () => {
          this.showMessage("Oprávnění přidáno", "success");
          this.loadPermissions();
        },
        (error) => {
          this.showMessage(error.statusText || "Chyba při přidání oprávnění", "error");
        }
      );
    },
    removePermission(item) {
      this.removeUserPermission(item.connectionId).then(
        () => {
          this.showMessage("Oprávnění odebráno", "success");
          this.loadPermissions();
        },
        (error) => {
          this.showMessage(error.statusText || "Chyba při odebrání oprávnění", "error");
        }
      );
    },
    addManyPermissions() {
      const notAdded = this.selectedPermissions.filter((p) => !p.added);
      const promises = notAdded.map((p) =>
        this.addUserPermission({
          UserId: this.permissionsDialog.userId,
          PermissionId: p.id,
        })
      );
      Promise.all(promises).then(() => {
        this.showMessage("Oprávnění přidána", "success");
        this.selectedPermissions.length = 0;
        this.loadPermissions();
      });
    },
    removeManyPermissions() {
      const added = this.selectedPermissions.filter((p) => p.added);
      const promises = added.map((p) => this.removeUserPermission(p.connectionId));
      Promise.all(promises).then(() => {
        this.showMessage("Oprávnění odebrána", "success");
        this.selectedPermissions.length = 0;
        this.loadPermissions();
      });
    },
  },
};
</script>
