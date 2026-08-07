<template>
  <v-container fluid fill-height class="login-background">
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="5" lg="4">
        <v-card class="elevation-12 pa-8">
          <v-card-title class="justify-center mb-8">
            <h2 class="text-h4 font-weight-medium primary--text">Přihlášení do FAD</h2>
          </v-card-title>

          <v-alert v-if="error" type="error" dismissible @input="error = null" class="mb-6">
            {{ error }}
          </v-alert>

          <v-form v-model="valid" @submit.prevent="handleLogin">
            <v-text-field
              v-model="email"
              label="Email"
              type="email"
              prepend-icon="mdi-account"
              outlined
              required
              :rules="[v => !!v || 'Email je povinný']"
              autofocus
            ></v-text-field>

            <v-text-field
              v-model="password"
              label="Heslo"
              type="password"
              prepend-icon="mdi-lock"
              outlined
              required
              :rules="[v => !!v || 'Heslo je povinné']"
            ></v-text-field>

            <v-btn
              type="submit"
              color="primary"
              block
              large
              :loading="loading"
              :disabled="!valid || loading"
              class="mt-6"
            >
              Přihlásit se
            </v-btn>
          </v-form>

          <v-card-actions class="justify-center mt-6">
            <small class="grey--text">FAD v4 • Hasiči Olomouc</small>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>

export default {

  data() {
    return {
      email: "",
      password: "",
      loading: false,
      error: null,
      valid: false,
    };
  },

  methods: {
    async handleLogin() {
      this.loading = true;
      this.error = null;
      try {
        await this.$store.dispatch("auth/login", {
          email: this.email,
          password: this.password,
        });
        //Load all data needed for Planner
        await this.$store.dispatch("auth/loadAllGlobalData");
        const redirect = this.$route.query.redirect || "/planner";
        this.$router.push(redirect);
      } catch (err) {
        console.error(err);
        this.error = err.body?.message || err.message || "Neplatný email nebo heslo";
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.login-background {
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  min-height: 100vh;
}
</style>
