<template>
  <v-container>
    <v-card>
      <v-card-title>{{ pageTitle }}</v-card-title>
      <v-card-text>
        <p>Stránka zatím není ve verzi 3 implementována.</p>
        <p>Jedná se o náhradní (placeholder) stránku přenesenou z verze 1.</p>
      </v-card-text>
      <v-card-actions>
        <v-btn
          color="primary"
          :href="v1Url"
          target="_blank"
        >
          Otevřít ve verzi 1
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script>
export default {
  name: "Placeholder",
  computed: {
    pageTitle() {
      return this.$route.meta.title || this.$route.name || "Stránka";
    },
    v1Url() {
      return `https://fada.hasici-ol.cz/fad-fe/v1/#${this.$route.path}`;
    },
  },
};
</script>
