<template>
  <v-container fluid>
    <v-card flat>
      <!-- Table controls -->
      <v-card-title class="px-3 d-flex align-center justify-space-between flex-wrap">
        <div class="d-flex align-center">
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
        <template v-slot:body="{ items }">
          <tbody>
            <tr v-for="item in items" :key="item.id">
              <td colspan="6">
                <div class="d-flex align-center log-line-1">
                  <div class="log-col" style="width: 70px">
                    <span class="log-label">Id</span>
                    <span class="log-value">{{ item.id }}</span>
                  </div>
                  <div class="log-col" style="width: 170px">
                    <span class="log-label">Datum</span>
                    <span class="log-value">{{ item.dateText }}</span>
                  </div>
                  <div class="log-col" style="width: 220px">
                    <span class="log-label">Uživatel</span>
                    <span class="log-value">{{ item.user }}</span>
                  </div>
                  <div class="log-col" style="width: 170px">
                    <span class="log-label">Zdroj</span>
                    <span class="log-value">{{ item.source }}</span>
                  </div>
                  <div class="log-col" style="width: 170px">
                    <span class="log-label">Kategorie</span>
                    <span class="log-value">{{ item.category }}</span>
                  </div>
                  <v-chip
                    small
                    :color="item.active == '1' ? 'green' : 'red'"
                    text-color="white"
                  >
                    {{ item.active == "1" ? "Aktivní" : "Neaktivní" }}
                  </v-chip>
                </div>
                <div class="log-line-2">
                  <span class="log-label">Zpráva</span>
                  <span class="log-value">{{ item.message }}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </template>
      </v-data-table>
    </v-card>

    <!-- Messages -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
      {{ snackbar.text }}
    </v-snackbar>
  </v-container>
</template>

<script>
export default {
  name: "FadLogs",
  data() {
    return {
      items: [],
      loading: true,
      search: "",
      selectedStatuses: [1],
      snackbar: {
        show: false,
        text: "",
        color: "info",
      },
    };
  },
  computed: {
    statuses() {
      return [
        { text: "Aktivní", value: 1 },
        { text: "Neaktivní", value: 0 },
      ];
    },
    headers() {
      return [
        { text: "Id", value: "id", width: 70 },
        { text: "Datum", value: "date", width: 170 },
        { text: "Uživatel", value: "user", width: 220 },
        { text: "Zdroj", value: "source", width: 170 },
        { text: "Kategorie", value: "category", width: 170 },
        { text: "Zpráva", value: "message" },
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
        date: r.date ? new Date(r.date).toISOString() : null,
        dateText: r.date ? new Date(r.date).toLocaleString("cs-CZ") : "-",
        user: r.user,
        source: r.source,
        category: r.category,
        message: r.message,
        active: r.active,
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
        .get("crud/fad/fad-logs")
        .then(
          (response) => {
            this.items = response.body || [];
            this.loading = false;
          },
          (error) => {
            this.loading = false;
            this.showMessage(error.statusText || "Chyba při načítání logů", "error");
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

<style scoped>
.log-line-1 {
  flex-wrap: nowrap;
}
.log-col {
  flex-shrink: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding-right: 8px;
}
.log-line-2 {
  margin-top: 4px;
  border-top: 1px solid #e0e0e0;
  padding-top: 4px;
}
.log-label {
  color: #9e9e9e;
  font-size: 11px;
  margin-right: 6px;
}
.log-value {
  font-size: 13px;
}
</style>
