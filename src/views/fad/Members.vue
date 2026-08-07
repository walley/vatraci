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
          <v-btn small color="purple" icon @click="manageSpecializations(item)">
            <v-icon>mdi-account-group</v-icon>
          </v-btn>
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
          {{ dialog.action === "create" ? "Nový příslušník" : "Příslušník" }}
        </v-card-title>
        <v-form v-model="dialog.formValid">
          <v-card-text>
            <v-text-field
              v-model="dialog.form.firstName"
              :label="'Jméno'"
              :rules="[rules.required]"
              hide-details
              class="mb-4"
            ></v-text-field>
            <v-text-field
              v-model="dialog.form.lastName"
              :label="'Příjmení'"
              :rules="[rules.required]"
              hide-details
              class="mb-4"
            ></v-text-field>
            <v-text-field
              v-model="dialog.form.serialNumber"
              :label="'Osobní číslo'"
              hide-details
              class="mb-4"
            ></v-text-field>
            <v-autocomplete
              v-model="dialog.form.FireStationId"
              :items="fireStationOptions"
              :loading="fireStationsLoading"
              :label="'Požární stanice'"
              hide-details
              menu-props="bottom"
              clearable
              class="mb-4"
            ></v-autocomplete>
            <v-autocomplete
              v-model="dialog.form.ShiftId"
              :items="shiftOptions"
              :loading="shiftsLoading"
              :label="'Směna'"
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

    <!-- Member specializations dialog -->
    <v-dialog v-model="specializationsDialog.show" max-width="600">
      <v-card>
        <v-card-title class="headline">
          Specializace příslušníka
          <v-spacer></v-spacer>
          <v-chip small color="primary" text-color="white">
            {{ specializationsDialog.memberName }}
          </v-chip>
        </v-card-title>
        <v-card-text>
          <v-list dense>
            <v-list-item v-for="row in specializationsDialog.rows" :key="row.id">
              <v-list-item-content>
                <v-list-item-title>{{ row.name }}</v-list-item-title>
                <v-list-item-subtitle>{{ row.code }}</v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action>
                <v-btn small color="grey darken-3" icon @click="removeSpecialization(row)">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </v-list-item-action>
            </v-list-item>
            <v-list-item v-if="specializationsDialog.rows.length === 0">
              <v-list-item-content>
                <v-list-item-subtitle>Žádné specializace</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>
          <v-divider class="my-3"></v-divider>
          <div class="d-flex align-center">
            <v-autocomplete
              v-model="specializationsDialog.selectedSpecializationId"
              :items="specializationOptions"
              :loading="specializationsLoading"
              :label="'Přidat specializaci'"
              hide-details
              menu-props="bottom"
              clearable
              class="mr-3"
            ></v-autocomplete>
            <v-btn
              color="green"
              :disabled="!specializationsDialog.selectedSpecializationId"
              @click="addSpecialization()"
            >
              <v-icon>mdi-plus</v-icon>
            </v-btn>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey darken-3" text @click="specializationsDialog.show = false">Zavřít</v-btn>
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
  name: "Members",
  data() {
    return {
      items: [],
      fireStations: [],
      fireStationsLoading: false,
      shifts: [],
      shiftsLoading: false,
      specializations: [],
      specializationsLoading: false,
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
      specializationsDialog: {
        show: false,
        memberId: null,
        memberName: "",
        rows: [],
        selectedSpecializationId: null,
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
    fireStationOptions() {
      return this.fireStations.map((f) => ({ value: f.id, text: f.name }));
    },
    shiftOptions() {
      return this.shifts.map((s) => ({ value: s.id, text: s.name }));
    },
    specializationOptions() {
      return this.specializations.map((s) => ({ value: s.id, text: s.name }));
    },
    headers() {
      return [
        { text: "Akce", value: "actions", sortable: false },
        { text: "Id", value: "id" },
        { text: "Jméno", value: "firstName" },
        { text: "Příjmení", value: "lastName" },
        { text: "Osobní číslo", value: "serialNumber" },
        { text: "Požární stanice", value: "fireStation" },
        { text: "Směna", value: "shift" },
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
        firstName: r.firstName,
        lastName: r.lastName,
        serialNumber: r.serialNumber,
        active: r.active,
        fireStation: r.FireStation ? r.FireStation.name : "-",
        shift: r.Shift ? r.Shift.code : "-",
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
    this.loadFireStations();
    this.loadShifts();
    this.loadSpecializations();
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
        .get("crud/fad/members")
        .then(
          (response) => {
            this.items = response.body || [];
            this.loading = false;
          },
          (error) => {
            this.loading = false;
            this.showMessage(error.statusText || "Chyba při načítání příslušníků", "error");
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
    loadShifts() {
      this.shiftsLoading = true;
      this.$http
        .get("crud/fad/shifts")
        .then(
          (response) => {
            this.shifts = (response.body || []).filter((s) => s.active == 1);
            this.shiftsLoading = false;
          },
          (error) => {
            this.shiftsLoading = false;
            this.showMessage(error.statusText || "Chyba při načítání směn", "error");
          }
        );
    },
    loadSpecializations() {
      this.specializationsLoading = true;
      this.$http
        .get("crud/fad/specializations")
        .then(
          (response) => {
            this.specializations = (response.body || []).filter((s) => s.active == 1);
            this.specializationsLoading = false;
          },
          (error) => {
            this.specializationsLoading = false;
            this.showMessage(error.statusText || "Chyba při načítání odborností", "error");
          }
        );
    },
    loadItem(id) {
      return this.$http.get(`crud/fad/members/${id}`);
    },
    createItem(params) {
      return this.$http.post("crud/fad/members", params);
    },
    updateItem(id, params) {
      return this.$http.put(`crud/fad/members/${id}`, params);
    },

    // ## Table actions
    create() {
      this.dialog = {
        show: true,
        action: "create",
        id: null,
        form: {
          firstName: "",
          lastName: "",
          serialNumber: "",
          FireStationId: null,
          ShiftId: null,
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
              firstName: r.firstName,
              lastName: r.lastName,
              serialNumber: r.serialNumber,
              FireStationId: r.FireStationId,
              ShiftId: r.ShiftId,
            },
            formValid: false,
          };
        },
        (error) => {
          this.showMessage(error.statusText || "Chyba při načítání příslušníka", "error");
        }
      );
    },
    store() {
      this.createItem({
        firstName: this.dialog.form.firstName,
        lastName: this.dialog.form.lastName,
        serialNumber: this.dialog.form.serialNumber,
        FireStationId: this.dialog.form.FireStationId,
        ShiftId: this.dialog.form.ShiftId,
      }).then(
        (response) => {
          if (response.body.status === 0) {
            this.showMessage("Příslušník vytvořen", "success");
            this.dialog.show = false;
            this.loadItems();
          } else {
            this.showMessage(response.body.msg || "Chyba při vytváření příslušníka", "error");
          }
        },
        (error) => {
          this.showMessage(error.statusText || "Chyba při vytváření příslušníka", "error");
        }
      );
    },
    update() {
      this.updateItem(this.dialog.id, {
        firstName: this.dialog.form.firstName,
        lastName: this.dialog.form.lastName,
        serialNumber: this.dialog.form.serialNumber,
        FireStationId: this.dialog.form.FireStationId,
        ShiftId: this.dialog.form.ShiftId,
      }).then(
        (response) => {
          if (response.body.status === 0) {
            this.showMessage("Příslušník upraven", "success");
            this.dialog.show = false;
            this.loadItems();
          } else {
            this.showMessage(response.body.msg || "Chyba při úpravě příslušníka", "error");
          }
        },
        (error) => {
          this.showMessage(error.statusText || "Chyba při úpravě příslušníka", "error");
        }
      );
    },
    suspend(item) {
      this.updateItem(item.id, { active: 0 }).then(
        (response) => {
          if (response.body.status === 0) {
            this.showMessage("Příslušník suspendován", "success");
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
            this.showMessage("Příslušník obnoven", "success");
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
        this.showMessage("Vybraní příslušníci suspendováni", "success");
        this.selected = [];
        this.loadItems();
      });
    },
    restoreSelected() {
      const promises = this.selected.map((item) => this.updateItem(item.id, { active: 1 }));
      Promise.all(promises).then(() => {
        this.showMessage("Vybraní příslušníci obnoveni", "success");
        this.selected = [];
        this.loadItems();
      });
    },
    clearFilters() {
      this.search = "";
      this.selectedStatuses = [1];
    },

    // ## Member specializations
    manageSpecializations(item) {
      this.specializationsDialog = {
        show: true,
        memberId: item.id,
        memberName: item.firstName + " " + item.lastName,
        rows: [],
        selectedSpecializationId: null,
      };
      this.$http
        .get("crud/fad/member-specializations")
        .then(
          (response) => {
            this.specializationsDialog.rows = (response.body || [])
              .filter((r) => parseInt(r.MemberId) === parseInt(this.specializationsDialog.memberId))
              .map((r) => ({
                id: r.id,
                MemberId: r.MemberId,
                SpecializationId: r.SpecializationId,
                name: r.Specialization ? r.Specialization.name : "-",
                code: r.Specialization ? r.Specialization.code : "",
              }));
          },
          (error) => {
            this.showMessage(error.statusText || "Chyba při načítání specializací", "error");
          }
        );
    },
    addSpecialization() {
      this.$http
        .post("crud/fad/member-specializations", {
          MemberId: this.specializationsDialog.memberId,
          SpecializationId: this.specializationsDialog.selectedSpecializationId,
        })
        .then(
          (response) => {
            if (response.body.status === 0) {
              this.showMessage("Specializace přidána", "success");
              this.specializationsDialog.selectedSpecializationId = null;
              this.$http.get("crud/fad/member-specializations").then(
                (res2) => {
                  this.specializationsDialog.rows = (res2.body || [])
                    .filter((r) => parseInt(r.MemberId) === parseInt(this.specializationsDialog.memberId))
                    .map((r) => ({
                      id: r.id,
                      MemberId: r.MemberId,
                      SpecializationId: r.SpecializationId,
                      name: r.Specialization ? r.Specialization.name : "-",
                      code: r.Specialization ? r.Specialization.code : "",
                    }));
                },
                (err2) => {
                  this.showMessage(err2.statusText || "Chyba při načítání specializací", "error");
                }
              );
            } else {
              this.showMessage(response.body.msg || "Chyba při přidávání specializace", "error");
            }
          },
          (error) => {
            this.showMessage(error.statusText || "Chyba při přidávání specializace", "error");
          }
        );
    },
    removeSpecialization(row) {
      if (!confirm("Opravdu chcete odebrat tuto specializaci?")) return;
      this.$http.delete(`crud/fad/member-specializations/${row.id}`).then(
        () => {
          this.showMessage("Specializace odebrána", "success");
          this.specializationsDialog.rows = this.specializationsDialog.rows.filter(
            (r) => r.id !== row.id
          );
        },
        (error) => {
          this.showMessage(error.statusText || "Chyba při odebírání specializace", "error");
        }
      );
    },
  },
};
</script>
