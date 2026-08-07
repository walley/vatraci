<template>
  <div class="about pa-4">
    <!-- Hero -->
    <v-sheet class="hero pa-8 mb-6 rounded-lg" dark>
      <div class="d-flex align-center flex-wrap">
        <div class="hero-icon mr-6">
          <v-icon size="72">mdi-fire</v-icon>
        </div>
        <div>
          <div class="display-2 font-weight-bold text--lighten-5">FADAdmin</div>
          <div class="title font-weight-light">
            Systém pro řízení směn a denního rozkazu Hasičského záchranného sboru
          </div>
        </div>
        <v-spacer></v-spacer>
        <div class="hero-truck">
          <svg viewBox="0 0 420 250" xmlns="http://www.w3.org/2000/svg" width="380" height="220">
            <!-- ground shadow -->
            <ellipse cx="200" cy="228" rx="180" ry="8" fill="rgba(0,0,0,.35)" />
            <!-- chassis -->
            <rect x="45" y="150" width="290" height="14" rx="4" fill="#2c2c2c" />
            <!-- rear body -->
            <rect x="45" y="70" width="185" height="80" rx="6" fill="#e53935" />
            <!-- white stripe -->
            <rect x="45" y="130" width="185" height="10" fill="#ffffff" opacity=".85" />
            <!-- side panels -->
            <rect x="55" y="82" width="40" height="22" rx="3" fill="#ffcdd2" />
            <rect x="102" y="82" width="40" height="22" rx="3" fill="#ffcdd2" />
            <rect x="149" y="82" width="40" height="22" rx="3" fill="#ffcdd2" />
            <!-- cab -->
            <path d="M235 78 L262 56 H330 V164 H235 Z" fill="#d32f2f" />
            <!-- cab window -->
            <path d="M245 78 L266 62 H295 V78 Z" fill="#bbdefb" />
            <rect x="300" y="60" width="24" height="104" rx="4" fill="#c62828" />
            <!-- light bar -->
            <rect x="250" y="48" width="70" height="10" rx="5" fill="#ffc107" />
            <circle cx="262" cy="53" r="6" fill="#fff176" />
            <circle cx="308" cy="53" r="6" fill="#fff176" />
            <!-- ladder -->
            <line x1="55" y1="40" x2="215" y2="40" stroke="#b0bec5" stroke-width="5" />
            <line x1="55" y1="58" x2="215" y2="58" stroke="#b0bec5" stroke-width="5" />
            <g stroke="#90a4ae" stroke-width="3">
              <line x1="70" y1="40" x2="70" y2="58" />
              <line x1="90" y1="40" x2="90" y2="58" />
              <line x1="110" y1="40" x2="110" y2="58" />
              <line x1="130" y1="40" x2="130" y2="58" />
              <line x1="150" y1="40" x2="150" y2="58" />
              <line x1="170" y1="40" x2="170" y2="58" />
              <line x1="190" y1="40" x2="190" y2="58" />
            </g>
            <!-- wheel guards -->
            <path d="M80 164 A45 45 0 0 1 160 164 Z" fill="#2c2c2c" />
            <path d="M250 164 A45 45 0 0 1 330 164 Z" fill="#2c2c2c" />
            <!-- wheels -->
            <circle cx="120" cy="184" r="30" fill="#212121" />
            <circle cx="290" cy="184" r="30" fill="#212121" />
            <circle cx="120" cy="184" r="14" fill="#9e9e9e" />
            <circle cx="290" cy="184" r="14" fill="#9e9e9e" />
            <!-- hose -->
            <circle cx="62" cy="92" r="11" fill="#455a64" />
            <path d="M62 92 H245" stroke="#455a64" stroke-width="5" stroke-linecap="round" />
          </svg>
        </div>
      </div>
    </v-sheet>

    <!-- Version info -->
    <v-row class="mb-6">
      <v-col cols="12" md="4">
        <v-card class="rounded-lg" elevation="2">
          <v-card-title class="pb-0">
            <v-icon color="red darken-2" class="mr-2">mdi-information-outline</v-icon>
            <span class="title">Základní informace</span>
          </v-card-title>
          <v-card-text>
            <v-list dense>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>Verze</v-list-item-title>
                </v-list-item-content>
                <v-list-item-content class="align-end">
                  <v-list-item-title class="text-right font-weight-bold">4</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>Subverze</v-list-item-title>
                </v-list-item-content>
                <v-list-item-content class="align-end">
                  <v-list-item-title class="text-right font-weight-bold">4</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Feature cards -->
      <v-col cols="12" md="8">
        <v-row>
          <v-col cols="12" sm="6" md="4" v-for="feature in features" :key="feature.title">
            <v-card class="feature-card rounded-lg text-center pa-4" elevation="2" height="100%">
              <div class="feature-icon mx-auto mb-3">
                <v-icon size="36">{{ feature.icon }}</v-icon>
              </div>
              <div class="subtitle-1 font-weight-medium">{{ feature.title }}</div>
              <div class="caption grey--text">{{ feature.text }}</div>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <!-- Footer -->
    <v-footer color="transparent" class="justify-center">
      <div class="caption grey--text text-center">
        <v-icon small class="mr-1">mdi-fire</v-icon>
        FADAdmin verze 4 &bull; Hasiči Olomouc
      </div>
    </v-footer>
  </div>
</template>

<script>
export default {
  name: "About",
  data() {
    return {
      features: [
        {
          icon: "mdi-calendar-month",
          title: "Plánovač nepřítomnosti",
          text: "Přehled směn a volna na jednotlivé dny a měsíce.",
        },
        {
          icon: "mdi-fire",
          title: "Denní rozkaz",
          text: "Rozkazy, poznámky a důležité informace pro směny.",
        },
        {
          icon: "mdi-account-group",
          title: "Příslušníci a směny",
          text: "Evidence členů, specializací, odborností a obsazení výjezdů.",
        },
        {
          icon: "mdi-fire-extinguisher",
          title: "Bezpečnost a požární ochrana",
          text: "Nástroje pro podporu provozu hasičské jednotky.",
        },
        {
          icon: "mdi-axe",
          title: "FAD Oprávnění",
          text: "Správa přístupů uživatelů k jednotlivým modulům FAD.",
        },
        {
          icon: "mdi-alarm-light",
          title: "Rychlý přehled",
          text: "Výjezdy, pozice a klíčové údaje na jednom místě.",
        },
      ],
    };
  },
};
</script>

<style scoped>
.hero {
  background: linear-gradient(135deg, #212121 0%, #4a0e0e 55%, #212121 100%);
}
.hero-icon {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 152, 0, 0.35) 0%, rgba(255, 82, 82, 0.15) 60%, transparent 70%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ff7043;
  animation: pulse 2.5s ease-in-out infinite;
}
.hero-truck {
  margin-top: 8px;
}
.feature-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: linear-gradient(135deg, #ef5350, #c62828);
}
.feature-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15) !important;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
@keyframes pulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(255, 112, 67, 0.55);
  }
  50% {
    box-shadow: 0 0 0 18px rgba(255, 112, 67, 0);
  }
}
</style>
