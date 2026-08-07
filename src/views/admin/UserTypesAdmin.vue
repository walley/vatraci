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
        <template v-for="field in booleanFields" v-slot:[`item.${field}`]="{ item }">
          <v-icon :key="field">{{ item[field] ? "mdi-check" : "mdi-close" }}</v-icon>
        </template>
      </v-data-table>
    </v-card>

    <!-- Create / edit dialog -->
    <v-dialog v-model="dialog.show" max-width="600" persistent>
      <v-card>
        <v-card-title class="headline">
          {{ dialog.action === "create" ? "Nový typ uživatele" : "Typ uživatele" }}
        </v-card-title>
        <v-form v-model="dialog.formValid">
          <v-card-text>
            <v-text-field
              v-model="dialog.form.name"
              :label="'Název typu uživatele'"
              :rules="[rules.required]"
              hide-details
              class="mb-4"
            ></v-text-field>
            <v-checkbox
              v-model="dialog.form.read"
              :label="'Číst'"
              hide-details
              class="mb-2"
            ></v-checkbox>
            <v-checkbox
              v-model="dialog.form.insert"
              :label="'Vkládat'"
              hide-details
              class="mb-2"
            ></v-checkbox>
            <v-checkbox
              v-model="dialog.form.update"
              :label="'Upravovat'"
              hide-details
              class="mb-2"
            ></v-checkbox>
            <v-checkbox
              v-model="dialog.form.delete"
              :label="'Mazat'"
              hide-details
              class="mb-2"
            ></v-checkbox>
            <v-checkbox
              v-model="dialog.form.admin"
              :label="'Admin'"
              hide-details
            ></v-checkbox>
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
  name: "UserTypesAdmin",
  data() {
    return {
      items: [],
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
    booleanFields() {
      return ["read", "insert", "update", "delete", "admin"];
    },
    headers() {
      return [
        { text: "Akce", value: "actions", sortable: false },
        { text: "Id", value: "id" },
        { text: "Název typu uživatele", value: "name" },
        { text: "Číst", value: "read" },
        { text: "Vkládat", value: "insert" },
        { text: "Upravovat", value: "update" },
        { text: "Mazat", value: "delete" },
        { text: "Admin", value: "admin" },
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
        name: r.name,
        read: !!r.read,
        insert: !!r.insert,
        update: !!r.update,
        delete: !!r.delete,
        admin: !!r.admin,
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
        .get("crud/admin/user-types")
        .then(
          (response) => {
            this.items = response.body || [];
            this.loading = false;
          },
          (error) => {
            this.loading = false;
            this.showMessage(error.statusText || "Chyba při načítání typů uživatelů", "error");
          }
        );
    },
    loadItem(id) {
      return this.$http.get(`crud/admin/user-types/${id}`);
    },
    createItem(params) {
      return this.$http.post("crud/admin/user-types", params);
    },
    updateItem(id, params) {
      return this.$http.put(`crud/admin/user-types/${id}`, params);
    },
    destroyItem(id) {
      return this.$http.delete(`crud/admin/user-types/${id}`);
    },

    // ## Table actions
    create() {
      this.dialog = {
        show: true,
        action: "create",
        id: null,
        form: {
          name: "",
          read: true,
          insert: true,
          update: true,
          delete: true,
          admin: true,
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
              name: r.name,
              read: !!r.read,
              insert: !!r.insert,
              update: !!r.update,
              delete: !!r.delete,
              admin: !!r.admin,
            },
            formValid: false,
          };
        },
        (error) => {
          this.showMessage(error.statusText || "Chyba při načítání typu uživatele", "error");
        }
      );
    },
    store() {
      this.createItem(this.dialog.form).then(
        (response) => {
          if (response.body.status === 0) {
            this.showMessage("Typ uživatele vytvořen", "success");
            this.dialog.show = false;
            this.loadItems();
          } else {
            this.showMessage(response.body.msg || "Chyba při vytváření typu uživatele", "error");
          }
        },
        (error) => {
          this.showMessage(error.statusText || "Chyba při vytváření typu uživatele", "error");
        }
      );
    },
    update() {
      this.updateItem(this.dialog.id, this.dialog.form).then(
        (response) => {
          if (response.body.status === 0) {
            this.showMessage("Typ uživatele upraven", "success");
            this.dialog.show = false;
            this.loadItems();
          } else {
            this.showMessage(response.body.msg || "Chyba při úpravě typu uživatele", "error");
          }
        },
        (error) => {
          this.showMessage(error.statusText || "Chyba při úpravě typu uživatele", "error");
        }
      );
    },
    destroy(item) {
      if (!confirm("Opravdu chcete odstranit tento typ uživatele?")) return;
      this.destroyItem(item.id).then(
        () => {
          this.showMessage("Typ uživatele odstraněn", "success");
          this.loadItems();
        },
        (error) => {
          this.showMessage(error.statusText || "Chyba při odstraňování typu uživatele", "error");
        }
      );
    },
    destroySelected() {
      if (!confirm("Opravdu chcete odstranit vybrané typy uživatelů?")) return;
      const promises = this.selected.map((item) => this.destroyItem(item.id));
      Promise.all(promises).then(() => {
        this.showMessage("Vybrané typy uživatelů odstraněny", "success");
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
