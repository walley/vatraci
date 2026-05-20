<template>
  <v-container class="fill-height d-flex flex-column justify-center align-center">
    <v-card class="pa-6" max-width="400">
      <v-card-title class="text-h5">Odhlášení</v-card-title>

      <v-card-text>
        <p>Byl jste úspěšně odhlášen.</p>
      </v-card-text>

      <v-card-actions>
        <v-btn color="primary" block @click="$router.push('/login')">
          Přihlásit se znovu
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script>
export default {
  name: "Logout",
};
</script>
