import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

import router from "./router";
import { createPinia } from "pinia";

import "vuetify/styles";
import { createVuetify } from "vuetify";
import "@mdi/font/css/materialdesignicons.css";
import {aliases, mdi} from "vuetify/iconsets/mdi";
import "@mdi/font/css/materialdesignicons.css";

const vuetify = createVuetify({
  icons: {
    defaultSet: "mdi",
    aliases,
    sets: {
      mdi,
    },
  },

  theme: {
    defaultTheme: "light",
    themes: {
      light: {
        colors: {
          background: "#ffffff",
        },
      },
      dark: {
        colors: {
          background: "#121212",
        },
      },
    },
  },
});

const app = createApp(App);

const pinia = createPinia();

app.use(router);
app.use(pinia);
app.use(vuetify);

app.mount('#app');