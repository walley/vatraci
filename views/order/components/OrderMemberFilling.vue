<template>
  <!-- v-dialog :value="dialog" max-width="290" -->
  <div>
    <v-card>
      <v-card-title>Doplnění</v-card-title>
      <v-card-text>
        <v-row>
          <v-data-table
            :headers="headers"
            :items="items"
            disable-pagination
            :hide-default-footer="true"
            class="elevation-1"
            dense
          >
            <template v-slot:[`item.actions`]="{ item }">
              <v-icon
                small
                @click="deleteItemDialog(item.id)"
                :disabled="cReadOnly"
                >mdi-delete</v-icon
              >
            </template>
          </v-data-table>

          <!-- v-data-table
          hide-default-footer
          dense
          :headers="headers"
          :items="dOrderNotes"
          class="elevation-1"
        ></v-data-table -->
        </v-row>
      </v-card-text>
      <v-card-actions v-if="items.length > -1">
        <v-btn small color="error" @click="createItem()" :disabled="cReadOnly">
          Přidat příslušníka
        </v-btn>
      </v-card-actions>
    </v-card>
    <!----- DIALOG ------>
    <v-dialog v-model="dialog" width="800">
      <template
        v-slot:activator="{
          /*on*/
        }"
      >
        <!-- v-btn x-small color="warning" fab darki v-on="on" v-show="false">
          <v-icon>account</v-icon>
        </v-btn -->
      </template>
      <v-card>
        <v-card-title class="headline grey lighten-2" primary-title
          >Výběr příslušníka</v-card-title
        >
        <v-card-text>
          <v-select :items="availableMembers" v-model="selectedMember">
            <template slot="item" slot-scope="{ item }"
              >{{ item.lastName }}, {{ item.firstName }} -
              {{ item.Shift.code }} - {{ item.FireStation.name }}
              {{
                item.Specializations.length > 0
                  ? " - [" +
                    item.Specializations.map((s) => s.code).toString() +
                    "]"
                  : ""
              }}
            </template>
            <template v-slot:selection="{ item }">
              {{ getItemText(item) }}
            </template>
          </v-select>
          <!-- v-card-subtitle>Poznámka</v-card-subtitle -->
          <!-- v-textarea
            label="Poznamka"
            v-model="dActualItem.note"
          ></v-textarea -->
        </v-card-text>
        <v-divider></v-divider>
        <!-- ID: {{ dActualOrderNote.id }}
        Autor: {{ dActualOrderNote.User}}
        Poznamka: {{ dActualOrderNote.note }}
        -->
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="cancelItem()">Storno</v-btn>
          <v-btn color="primary" text @click="saveItem()">OK</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- /v-dialog -->
    <v-dialog v-model="confirmationDialog" persistent max-width="290">
      <v-card>
        <v-card-title class="headline"> Potvrzení smazání </v-card-title>
        <v-card-text>Opravdu si přejete smazat položku?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="green darken-1"
            text
            @click="confirmationDialog = false"
          >
            Ne
          </v-btn>
          <v-btn
            color="green darken-1"
            text
            @click="itemDeletionConfirmation()"
          >
            Ano
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import fadHelper from "@/fadHelper.js";
//import OrderNotesConfirmDialog from './OrderNotesConfirmDialog.vue'
//import { mapActions } from 'vuex'

export default {
  components: {},
  props: {
    shift: Object,
    fireStationId: Number,
    date: String,
  },
  data: () => ({
    dialog: false,
    confirmationDialog: false,
    dIdForDelete: 0,
    //dActualOrderNote: {id: 0, date: this.$parent.date, note: '', UserId: 0, ShiftId: this.$parent.shiftId, FireStationId: this.$parent.dSelectedFireStationId},
    dActualItem: {},
    selectedMember: {},
    items: [],
    headers: [
      {
        text: "Id",
        align: "left",
        sortable: false,
        value: "id",
      },
      { text: "Datum", value: "date" },
      { text: "Příslušník", value: "Member.fullName" },
      { text: "Akce", value: "actions", sortable: false },
    ],
  }),
  computed: {
    cUserId: function () {
      //return JSON.parse(this.$store.state.auth.userId)
      return 1;
    },
    cReadOnly: function () {
      /*var permissions = JSON.parse(this.$store.state.auth.permissions)
      if (permissions.find((p) => p == 'FADFIREFIGHTER')) {
        return true
      } else return false
      */
      return false;
    },
    availableMembers: function () {
      var lMembers = this.cGlobalDataForSelected.members;
      return lMembers;
    },
    cGlobalDataForSelected: function () {
      return this.$store.state.stateGlobalDataForSelected;
    },
    cGlobalSelected: function () {
      return this.$store.state.stateGlobalSelected;
    },

    ...mapGetters(["getterFetchData", "getterCreateData"]),
  },
  methods: {
    getItemText(item) {
      return `
    ${item.lastName}, ${item.firstName} -
              ${item.Shift.code} - ${item.FireStation.name}
              ${
                item.Specializations.length > 0
                  ? " - [" +
                    item.Specializations.map((s) => s.code).toString() +
                    "]"
                  : ""
              }
    `;
    },
    async mFetchItems() {
      this.items = await this.getterFetchData({
        path: "planners",
        id: "",
        filter: `date=${this.date}&FireStationId=${this.fireStationId}&Position.name=Doplnění`,
      }); /*.filter(
        (o) =>
          o.FireStationId == this.$store.state.stateGlobalSelected.fireStationId
      );*/
    },
    editItem(id) {
      this.dActualItem = this.items.find((n) => n.id == id);
      this.dialog = !this.dialog;
      console.debug("editItem");
      //this.$router.push({ name: "tutorial-details", params: { id: id } });
    },

    //async orderNoteDeletionConfirmation(id) {
    async itemDeletionConfirmation() {
      let id = this.dIdForDelete;
      console.debug("deleteItem");
      this.dActualItem = this.items.find((n) => n.id == id);
      await this.getterCreateData({
        path: "planners",
        delete: 1,
        body: this.dActualItem,
      });
      this.mFetchItems();
      this.confirmationDialog = false;
      await this.$store.dispatch(
        "actionLoadGlobalDataForSelectedMonthPlanners",
        {}
      );
    },
    async deleteItemDialog(id) {
      console.debug("deleteItem with confirm dialog");
      this.dIdForDelete = id;
      this.confirmationDialog = !this.confirmationDialog;
    },
    createItem(/*id*/) {
      console.debug("createItem");
      (this.dActualItem = {
        id: 0,
        date: this.$store.state.stateGlobalSelected.date,
        ShiftId: this.shift.id,
        FireStationId: this.$store.state.stateGlobalSelected.fireStationId,
        CrewId: 8,
        PositionId: 35,
        MemberId: 0,
      }),
        (this.dialog = !this.dialog);
      //this.$router.push({ name: "tutorial-details", params: { id: id } });
    },
    async saveItem() {
      console.debug("saveItem");
      console.dir(this.selectedMember);
      this.dActualItem.MemberId = this.selectedMember.id;
      await this.getterCreateData({
        path: "planners",
        body: this.dActualItem,
      });
      this.mFetchItems();
      this.dialog = !this.dialog;
      await this.$store.dispatch(
        "actionLoadGlobalDataForSelectedMonthPlanners",
        {}
      );
    },
    cancelItem() {
      (this.dActualItem = {
        id: 0,
        date: this.$parent.cDate,
        note: "",
        UserId: this.cUserId,
        ShiftId: this.shift.id,
        FireStationId: this.$store.state.stateGlobalSelected.fireStationId,
      }),
        (this.dialog = !this.dialog);
    },
    onEventOrderChanged(payload) {
      console.debug(`OrderNotes.vue:onEventOrderChanged(${payload})`);
      this.mFetchItems();
    },
  },
  created: function () {
    this.mFetchItems();
    fadHelper.consoleDebug(`OrderMemberFilling/created()`);
  },
  mounted: function () {
    console.log("Hooked event-order-changed");
    this.$root.$on("event-order-changed", this.onEventOrderChanged);
    this.$root.$on(
      "event-order-note-deletion-confirmation",
      this.onEventOrderNoteDeletionConfirmation
    );
    this.mFetchItems();
  },
  watch: {
    date(/*val*/) {
      this.mFetchItems();
    },
  },
};
</script>
