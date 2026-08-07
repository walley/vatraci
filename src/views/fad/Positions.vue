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
        </template>
        <template v-slot:[`item.strojnik`]="{ item }">
          <v-icon>{{ item.strojnik ? "mdi-check" : "mdi-close" }}</v-icon>
        </template>
        <template v-slot:[`item.velitel`]="{ item }">
          <v-icon>{{ item.velitel ? "mdi-check" : "mdi-close" }}</v-icon>
        </template>
        <template v-slot:[`item.available`]="{ item }">
          <v-icon>{{ item.available ? "mdi-check" : "mdi-close" }}</v-icon>
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
          {{ dialog.action === "create" ? "Nová pozice" : "Pozice" }}
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
            <v-autocomplete
              v-model="dialog.form.CrewId"
              :items="crewOptions"
              :loading="crewsLoading"
              :label="'Výjezd'"
              hide-details
              menu-props="bottom"
              clearable
              class="mb-4"
            ></v-autocomplete>
            <v-text-field
              v-model="dialog.form.sortValue"
              :label="'Třídění'"
              type="number"
              hide-details
              class="mb-4"
            ></v-text-field>
            <v-checkbox
              v-model="dialog.form.strojnik"
              :label="'Strojník'"
              hide-details
            ></v-checkbox>
            <v-checkbox
              v-model="dialog.form.velitel"
              :label="'Velitel'"
              hide-details
            ></v-checkbox>
            <v-checkbox
              v-model="dialog.form.available"
              :label="'Dostupný pro výjezd'"
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
  name: "Positions",
  data() {
    return {
      items: [],
      crews: [],
      crewsLoading: false,
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
    crewOptions() {
      return this.crews.map((c) => ({
        value: c.id,
        text: c.name + (c.FireStation ? ", " + c.FireStation.name : ""),
      }));
    },
    headers() {
      return [
        { text: "Akce", value: "actions", sortable: false },
        { text: "Id", value: "id" },
        { text: "Název", value: "name" },
        { text: "Strojník", value: "strojnik" },
        { text: "Velitel", value: "velitel" },
        { text: "Třídění", value: "sortValue" },
        { text: "Výjezd", value: "crew" },
        { text: "Dostupný pro výjezd", value: "available" },
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
        name: r.name,
        active: r.active,
        strojnik: !!r.strojnik,
        velitel: !!r.velitel,
        available: !!r.available,
        sortValue: r.sortValue,
        crew: r.Crew ? r.Crew.name : "-",
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
    this.loadCrews();
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
        .get("crud/fad/positions")
        .then(
          (response) => {
            this.items = response.body || [];
            this.loading = false;
          },
          (error) => {
            this.loading = false;
            this.showMessage(error.statusText || "Chyba při načítání pozic", "error");
          }
        );
    },
    loadCrews() {
      this.crewsLoading = true;
      this.$http
        .get("crud/fad/crews")
        .then(
          (response) => {
            this.crews = (response.body || []).filter((c) => c.active == 1);
            this.crewsLoading = false;
          },
          (error) => {
            this.crewsLoading = false;
            this.showMessage(error.statusText || "Chyba při načítání výjezdů", "error");
          }
        );
    },
    loadItem(id) {
      return this.$http.get(`crud/fad/positions/${id}`);
    },
    createItem(params) {
      return this.$http.post("crud/fad/positions", params);
    },
    updateItem(id, params) {
      return this.$http.put(`crud/fad/positions/${id}`, params);
    },

    // ## Table actions
    create() {
      this.dialog = {
        show: true,
        action: "create",
        id: null,
        form: {
          name: "",
          CrewId: null,
          sortValue: 0,
          strojnik: false,
          velitel: false,
          available: true,
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
              CrewId: r.CrewId,
              sortValue: r.sortValue,
              strojnik: !!r.strojnik,
              velitel: !!r.velitel,
              available: !!r.available,
            },
            formValid: false,
          };
        },
        (error) => {
          this.showMessage(error.statusText || "Chyba při načítání pozice", "error");
        }
      );
    },
    store() {
      this.createItem({
        name: this.dialog.form.name,
        CrewId: this.dialog.form.CrewId,
        sortValue: this.dialog.form.sortValue,
        strojnik: this.dialog.form.strojnik,
        velitel: this.dialog.form.velitel,
        available: this.dialog.form.available,
      }).then(
        (response) => {
          if (response.body.status === 0) {
            this.showMessage("Pozice vytvořena", "success");
            this.dialog.show = false;
            this.loadItems();
          } else {
            this.showMessage(response.body.msg || "Chyba při vytváření pozice", "error");
          }
        },
        (error) => {
          this.showMessage(error.statusText || "Chyba při vytváření pozice", "error");
        }
      );
    },
    update() {
      this.updateItem(this.dialog.id, {
        name: this.dialog.form.name,
        CrewId: this.dialog.form.CrewId,
        sortValue: this.dialog.form.sortValue,
        strojnik: this.dialog.form.strojnik,
        velitel: this.dialog.form.velitel,
        available: this.dialog.form.available,
      }).then(
        (response) => {
          if (response.body.status === 0) {
            this.showMessage("Pozice upravena", "success");
            this.dialog.show = false;
            this.loadItems();
          } else {
            this.showMessage(response.body.msg || "Chyba při úpravě pozice", "error");
          }
        },
        (error) => {
          this.showMessage(error.statusText || "Chyba při úpravě pozice", "error");
        }
      );
    },
    suspend(item) {
      this.updateItem(item.id, { active: 0 }).then(
        (response) => {
          if (response.body.status === 0) {
            this.showMessage("Pozice suspendována", "success");
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
            this.showMessage("Pozice obnovena", "success");
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
    suspendSelected() {
      const promises = this.selected.map((item) => this.updateItem(item.id, { active: 0 }));
      Promise.all(promises).then(() => {
        this.showMessage("Vybrané pozice suspendovány", "success");
        this.selected = [];
        this.loadItems();
      });
    },
    restoreSelected() {
      const promises = this.selected.map((item) => this.updateItem(item.id, { active: 1 }));
      Promise.all(promises).then(() => {
        this.showMessage("Vybrané pozice obnoveny", "success");
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
