<template>
  <!-- v-dialog :value="dialog" max-width="290" -->
  <div>
    <v-card>
      <v-card-title>Poznámky k rozkazu</v-card-title>
      <v-card-text>
        <v-row>
          <v-data-table
            :headers="headers"
            :items="dOrderNotes"
            disable-pagination
            :hide-default-footer="true"
            class="elevation-1"
            dense
          >
            <template v-slot:[`item.actions`]="{ item }">
              <v-icon
                small
                class="mr-2"
                @click="editNote(item.id)"
                :disabled="cReadOnly"
                >mdi-pencil</v-icon
              >
              <v-icon
                small
                @click="deleteNoteDialog(item.id)"
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
      <v-card-actions v-if="dOrderNotes.length > -1">
        <v-btn small color="error" @click="addNote()" :disabled="cReadOnly">
          Přidat poznámku
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
          >Poznámka</v-card-title
        >
        <v-card-text>
          <!-- v-card-subtitle>Poznámka</v-card-subtitle -->
          <v-textarea
            label="Poznámka"
            v-model="dActualOrderNote.note"
          ></v-textarea>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="cancelNote()">Storno</v-btn>
          <v-btn color="primary" text @click="saveNote()">OK</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- /v-dialog -->
    <v-dialog v-model="confirmationDialog" persistent max-width="290">
      <v-card>
        <v-card-title class="headline"> Potvrzení smazání </v-card-title>
        <v-card-text>Opravdu si přejete smazat poznámku?</v-card-text>
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
            @click="orderNoteDeletionConfirmation()"
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
    dActualOrderNote: {},
    dOrderNotes: [],
    headers: [
      {
        text: "Id",
        align: "left",
        sortable: false,
        value: "id",
      },
      { text: "Datum", value: "date" },
      { text: "Poznámka", value: "note" },
      { text: "Autor", value: "User.name" },
      { text: "Akce", value: "actions", sortable: false },
    ],
  }),
  computed: {
    cUserId: function () {
      return this.$store.getters["auth/id"];
    },
    cReadOnly: function () {
      /*var permissions = JSON.parse(this.$store.state.auth.permissions)
      if (permissions.find((p) => p == 'FADFIREFIGHTER')) {
        return true
      } else return false
      */
      return false;
    },
    ...mapGetters(["getterFetchData", "getterCreateData"]),
  },
  methods: {
    mOrderNotes: async function () {
      this.dOrderNotes = await this.getterFetchData({
        path: "order-notes",
        id: "",
        filter: `date=${this.date}&FireStationId=${this.fireStationId}`,
      }); /*.filter(
        (o) =>
          o.FireStationId == this.$store.state.stateGlobalSelected.fireStationId
      );*/
    },
    editNote(id) {
      this.dActualOrderNote = this.dOrderNotes.find((n) => n.id == id);
      this.dialog = !this.dialog;
      console.debug("editNote");
      //this.$router.push({ name: "tutorial-details", params: { id: id } });
    },

    //async orderNoteDeletionConfirmation(id) {
    async orderNoteDeletionConfirmation() {
      let id = this.dIdForDelete;
      console.debug("deleteNote");
      this.dActualOrderNote = this.dOrderNotes.find((n) => n.id == id);
      await this.getterCreateData({
        path: "order-notes",
        delete: 1,
        body: this.dActualOrderNote,
      });
      this.mOrderNotes();
      this.confirmationDialog = false;
    },
    async deleteNoteDialog(id) {
      console.debug("deleteNote with confirm dialog");
      this.dIdForDelete = id;
      this.confirmationDialog = !this.confirmationDialog;
    },
    addNote(/*id*/) {
      console.debug("Ordernotes addNote UserId: " + this.cUserId);
      alert("OrderNotes.vue:addNote UserId: " + this.cUserId);
      (this.dActualOrderNote = {
        id: 0,
        date: this.$store.state.stateGlobalSelected.date,
        note: "",
        UserId: this.cUserId,
        ShiftId: this.shift.id,
        FireStationId: this.$store.state.stateGlobalSelected.fireStationId,
      }),
      (this.dialog = !this.dialog);
    },
    async saveNote() {
      console.debug("saveNote");
      await this.getterCreateData({
        path: "order-notes",
        body: this.dActualOrderNote,
      });
      this.mOrderNotes();
      this.dialog = !this.dialog;
    },
    cancelNote() {
      (this.dActualOrderNote = {
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
      this.mOrderNotes();
    },
  },
  created: function () {
    this.mOrderNotes();
  },
  mounted: function () {
    //this.mOrderNotes();
    console.log("Hooked event-order-changed");
    this.$root.$on("event-order-changed", this.onEventOrderChanged);
    this.$root.$on(
      "event-order-note-deletion-confirmation",
      this.onEventOrderNoteDeletionConfirmation
    );
  },
  watch: {
    date(/*val*/) {
      this.mOrderNotes();
    },
    shift() {
      this.mOrderNotes();
    },
    fireStationId() {
      this.mOrderNotes();
    },
  },
};
</script>
