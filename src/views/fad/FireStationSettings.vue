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
        <template v-slot:[`item.value`]="{ item }">
          <pre class="json-view" v-html="item.valueHtml"></pre>
        </template>
        <template v-slot:[`item.active`]="{ item }">
          <v-chip small :color="item.active == '1' ? 'green' : 'red'" text-color="white">
            {{ item.active == "1" ? "Aktivní" : "Neaktivní" }}
          </v-chip>
        </template>
      </v-data-table>
    </v-card>

    <!-- Create / edit dialog -->
    <v-dialog v-model="dialog.show" max-width="900" persistent>
      <v-card>
        <v-card-title class="headline">
          {{ dialog.action === "create" ? "Nové nastavení požární stanice" : "Nastavení požární stanice" }}
        </v-card-title>
        <v-form v-model="dialog.formValid" @submit.prevent>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="dialog.form.key"
                  :label="'Klíč'"
                  :rules="[rules.required]"
                  hide-details
                  class="mb-4"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="8">
                <v-autocomplete
                  v-model="dialog.form.FireStationId"
                  :items="fireStations"
                  :loading="fireStationsLoading"
                  item-text="name"
                  item-value="id"
                  :label="'Požární stanice'"
                  hide-details
                  menu-props="bottom"
                  clearable
                ></v-autocomplete>
              </v-col>
            </v-row>

            <v-divider class="mb-4"></v-divider>

            <div class="d-flex align-center mb-2">
              <span class="subtitle-1 font-weight-medium">Hodnota (JSON)</span>
              <v-spacer></v-spacer>
              <v-chip
                small
                :color="valueValid ? 'green' : 'red'"
                text-color="white"
                class="mr-2"
              >
                {{ valueValid ? "Validní JSON" : "Neplatný JSON" }}
              </v-chip>
              <v-btn small color="blue" outlined @click="formatValue()">
                <v-icon small class="mr-1">mdi-code-json</v-icon>
                Formátovat
              </v-btn>
            </div>

            <v-textarea
              v-model="dialog.form.value"
              :label="'JSON'"
              rows="12"
              no-resize
              hide-details
              spellcheck="false"
              class="json-editor mb-2"
              @keydown.tab.prevent="insertTab"
            ></v-textarea>

            <div v-if="valueError" class="json-error mb-2">{{ valueError }}</div>

            <div class="subtitle-2 mb-1">Náhled (formátovaný)</div>
            <pre class="json-view" v-html="valuePreviewHtml"></pre>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="grey darken-3" text @click="dialog.show = false">Zavřít</v-btn>
            <v-btn
              :disabled="!dialog.formValid || !valueValid"
              v-if="dialog.action === 'create'"
              color="green"
              text
              @click="store()"
            >Vytvořit</v-btn>
            <v-btn
              :disabled="!dialog.formValid || !valueValid"
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
  name: "FireStationSettings",
  data() {
    return {
      items: [],
      fireStations: [],
      fireStationsLoading: false,
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
    headers() {
      return [
        { text: "Akce", value: "actions", sortable: false },
        { text: "Id", value: "id" },
        { text: "Klíč", value: "key" },
        { text: "Hodnota", value: "value", width: "40%" },
        { text: "Požární stanice", value: "fireStation" },
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
        key: r.key,
        active: r.active,
        value: r.value,
        valueHtml: this.highlightJson(r.value),
        fireStation: r.FireStation ? r.FireStation.name : "-",
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
            if (key === "_raw" || key === "valueHtml") continue;
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
    valueStatus() {
      if (this.dialog.form.value === undefined || this.dialog.form.value === "") {
        return { valid: true, error: "", pretty: "" };
      }
      try {
        const obj = JSON.parse(this.dialog.form.value);
        return {
          valid: true,
          error: "",
          pretty: JSON.stringify(obj, null, 2),
        };
      } catch (e) {
        return {
          valid: false,
          error: "Neplatný JSON: " + e.message,
          pretty: this.dialog.form.value,
        };
      }
    },
    valueValid() {
      return this.valueStatus.valid;
    },
    valueError() {
      return this.valueStatus.error;
    },
    valuePreviewHtml() {
      const raw = this.dialog.form.value || "";
      if (raw === "") return "";
      if (!this.valueStatus.valid) {
        return (
          '<span class="json-invalid">' +
          this.escapeHtml(raw) +
          "</span>"
        );
      }
      return this.highlightJson(this.valueStatus.pretty);
    },
  },
  created() {
    this.loadItems();
    this.loadFireStations();
  },
  methods: {
    // ## Messages
    showMessage(text, color) {
      this.snackbar = { show: true, text, color: color || "info" };
    },

    // ## JSON helpers
    escapeHtml(str) {
      return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    },
    highlightJson(value) {
      let str = "";
      try {
        str = JSON.stringify(JSON.parse(value), null, 2);
      } catch (e) {
        str = value || "";
      }
      str = this.escapeHtml(str);
      return str.replace(
        /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
        (match) => {
          let cls = "json-number";
          if (/^"/.test(match)) {
            cls = /:$/.test(match) ? "json-key" : "json-string";
          } else if (/true|false/.test(match)) {
            cls = "json-boolean";
          } else if (/null/.test(match)) {
            cls = "json-null";
          }
          return '<span class="' + cls + '">' + match + "</span>";
        }
      );
    },
    formatValue() {
      const status = this.valueStatus;
      if (status.valid && status.pretty !== "") {
        this.dialog.form.value = status.pretty;
      } else if (status.valid) {
        this.showMessage("JSON je prázdný", "info");
      } else {
        this.showMessage(status.error, "error");
      }
    },
    insertTab(e) {
      const el = e.target;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      this.dialog.form.value =
        this.dialog.form.value.substring(0, start) +
        "\t" +
        this.dialog.form.value.substring(end);
      this.$nextTick(() => {
        el.selectionStart = el.selectionEnd = start + 1;
      });
    },

    // ## API calls (same as version 1)
    loadItems() {
      this.loading = true;
      this.$http
        .get("crud/fad/fire-station-settings")
        .then(
          (response) => {
            this.items = response.body || [];
            this.loading = false;
          },
          (error) => {
            this.loading = false;
            this.showMessage(error.statusText || "Chyba při načítání nastavení", "error");
          }
        );
    },
    loadFireStations() {
      this.fireStationsLoading = true;
      this.$http
        .get("crud/fad/fire-stations")
        .then(
          (response) => {
            this.fireStations = (response.body || []).filter((f) => f.active == 1);
            this.fireStationsLoading = false;
          },
          (error) => {
            this.fireStationsLoading = false;
            this.showMessage(error.statusText || "Chyba při načítání požárních stanic", "error");
          }
        );
    },
    loadItem(id) {
      return this.$http.get(`crud/fad/fire-station-settings/${id}`);
    },
    createItem(params) {
      return this.$http.post("crud/fad/fire-station-settings", params);
    },
    updateItem(id, params) {
      return this.$http.put(`crud/fad/fire-station-settings/${id}`, params);
    },

    // ## Table actions
    create() {
      this.dialog = {
        show: true,
        action: "create",
        id: null,
        form: { key: "", value: "", FireStationId: null },
        formValid: false,
      };
    },
    edit(item) {
      this.loadItem(item.id).then(
        (response) => {
          const r = response.body;
          let value = r.value;
          try {
            value = JSON.stringify(JSON.parse(r.value), null, 2);
          } catch (e) {
            /* keep raw */
          }
          this.dialog = {
            show: true,
            action: "edit",
            id: r.id,
            form: {
              key: r.key,
              value: value,
              FireStationId: r.FireStationId,
            },
            formValid: false,
          };
        },
        (error) => {
          this.showMessage(error.statusText || "Chyba při načítání nastavení", "error");
        }
      );
    },
    store() {
      if (!this.valueValid) {
        this.showMessage("Neplatný JSON – záznam nebyl uložen", "error");
        return;
      }
      this.createItem({
        key: this.dialog.form.key,
        value: this.dialog.form.value,
        FireStationId: this.dialog.form.FireStationId,
      }).then(
        (response) => {
          if (response.body.status === 0) {
            this.showMessage("Nastavení vytvořeno", "success");
            this.dialog.show = false;
            this.loadItems();
          } else {
            this.showMessage(response.body.msg || "Chyba při vytváření nastavení", "error");
          }
        },
        (error) => {
          this.showMessage(error.statusText || "Chyba při vytváření nastavení", "error");
        }
      );
    },
    update() {
      if (!this.valueValid) {
        this.showMessage("Neplatný JSON – změny nebyly uloženy", "error");
        return;
      }
      this.updateItem(this.dialog.id, {
        key: this.dialog.form.key,
        value: this.dialog.form.value,
        FireStationId: this.dialog.form.FireStationId,
      }).then(
        (response) => {
          if (response.body.status === 0) {
            this.showMessage("Nastavení upraveno", "success");
            this.dialog.show = false;
            this.loadItems();
          } else {
            this.showMessage(response.body.msg || "Chyba při úpravě nastavení", "error");
          }
        },
        (error) => {
          this.showMessage(error.statusText || "Chyba při úpravě nastavení", "error");
        }
      );
    },
    suspend(item) {
      this.updateItem(item.id, { active: 0 }).then(
        (response) => {
          if (response.body.status === 0) {
            this.showMessage("Nastavení suspendováno", "success");
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
            this.showMessage("Nastavení obnoveno", "success");
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
        this.showMessage("Vybraná nastavení suspendována", "success");
        this.selected = [];
        this.loadItems();
      });
    },
    restoreSelected() {
      const promises = this.selected.map((item) => this.updateItem(item.id, { active: 1 }));
      Promise.all(promises).then(() => {
        this.showMessage("Vybraná nastavení obnovena", "success");
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

<style scoped>
.json-view {
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 8px 10px;
  border-radius: 6px;
  font-family: "Roboto Mono", "Courier New", monospace;
  font-size: 12px;
  line-height: 1.4;
  white-space: pre;
  overflow-x: auto;
  min-width: 300px;
}
.json-key {
  color: #9cdcfe;
}
.json-string {
  color: #ce9178;
}
.json-number {
  color: #b5cea8;
}
.json-boolean {
  color: #569cd6;
}
.json-null {
  color: #569cd6;
}
.json-invalid {
  color: #f97583;
}
.json-error {
  color: #f44336;
  font-size: 13px;
  margin-top: 4px;
}
.json-editor textarea {
  font-family: "Roboto Mono", "Courier New", monospace !important;
  font-size: 13px !important;
  line-height: 1.4 !important;
}
</style>
