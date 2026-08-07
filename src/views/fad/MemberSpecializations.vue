<template>
  <v-container fluid>
    <v-card flat>
      <!-- Table controls -->
      <v-card-title class="px-3 d-flex align-center justify-space-between flex-wrap">
        <div class="d-flex align-center">
          <v-btn x-large color="light-blue lighten-2" icon @click="create()">
            <v-icon>mdi-plus</v-icon>
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
        :headers="headers"
        :items="filteredItems"
        item-key="id"
        :no-results-text="'Záznam nebyl nalezen'"
        :no-data-text="'Data nejsou dostupná'"
        :footer-props="footerProps"
        :items-per-page="20"
        :loading="loading"
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
          {{ dialog.action === "create" ? "Nová specializace příslušníka" : "Specializace příslušníka" }}
        </v-card-title>
        <v-form v-model="dialog.formValid">
          <v-card-text>
            <v-autocomplete
              v-model="dialog.form.MemberId"
              :items="memberOptions"
              :loading="membersLoading"
              :label="'Příslušník'"
              :rules="[rules.required]"
              hide-details
              menu-props="bottom"
              clearable
              class="mb-4"
            ></v-autocomplete>
            <v-autocomplete
              v-model="dialog.form.SpecializationId"
              :items="specializationOptions"
              :loading="specializationsLoading"
              :label="'Specializace'"
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
  name: "MemberSpecializations",
  data() {
    return {
      items: [],
      members: [],
      membersLoading: false,
      specializations: [],
      specializationsLoading: false,
      loading: true,
      search: "",
      selectedStatuses: [1],
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
    memberOptions() {
      return this.members.map((m) => ({
        value: m.id,
        text:
          m.fullName +
          (m.Shift ? ", " + m.Shift.code : "") +
          (m.FireStation ? ", " + m.FireStation.name : ""),
      }));
    },
    specializationOptions() {
      return this.specializations.map((s) => ({ value: s.id, text: s.name }));
    },
    headers() {
      return [
        { text: "Akce", value: "actions", sortable: false },
        { text: "Id", value: "id" },
        { text: "Příslušník", value: "member" },
        { text: "Specializace", value: "specialization" },
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
        member: r.Member ? r.Member.fullName : "-",
        specialization: r.Specialization ? r.Specialization.name : "-",
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
    this.loadMembers();
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
        .get("crud/fad/member-specializations")
        .then(
          (response) => {
            this.items = response.body || [];
            this.loading = false;
          },
          (error) => {
            this.loading = false;
            this.showMessage(error.statusText || "Chyba při načítání specializací příslušníků", "error");
          }
        );
    },
    loadMembers() {
      this.membersLoading = true;
      this.$http
        .get("crud/fad/members")
        .then(
          (response) => {
            this.members = (response.body || []).filter((m) => m.active == 1);
            this.membersLoading = false;
          },
          (error) => {
            this.membersLoading = false;
            this.showMessage(error.statusText || "Chyba při načítání příslušníků", "error");
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
      return this.$http.get(`crud/fad/member-specializations/${id}`);
    },
    createItem(params) {
      return this.$http.post("crud/fad/member-specializations", params);
    },
    updateItem(id, params) {
      return this.$http.put(`crud/fad/member-specializations/${id}`, params);
    },
    destroyItem(id) {
      return this.$http.delete(`crud/fad/member-specializations/${id}`);
    },

    // ## Table actions
    create() {
      this.dialog = {
        show: true,
        action: "create",
        id: null,
        form: {
          MemberId: null,
          SpecializationId: null,
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
              MemberId: r.MemberId,
              SpecializationId: r.SpecializationId,
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
        MemberId: this.dialog.form.MemberId,
        SpecializationId: this.dialog.form.SpecializationId,
      }).then(
        (response) => {
          if (response.body.status === 0) {
            this.showMessage("Specializace příslušníka vytvořena", "success");
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
        MemberId: this.dialog.form.MemberId,
        SpecializationId: this.dialog.form.SpecializationId,
      }).then(
        (response) => {
          if (response.body.status === 0) {
            this.showMessage("Specializace příslušníka upravena", "success");
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
    clearFilters() {
      this.search = "";
      this.selectedStatuses = [1];
    },
  },
};
</script>
