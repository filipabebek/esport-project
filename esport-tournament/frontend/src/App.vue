<script setup>
import { RouterView, useRoute } from "vue-router";
import NavBar from "./components/NavBar.vue";

const route = useRoute();
</script>

<template>
  <div class="app">
    <NavBar v-if="!route.meta.hideNavbar" />
    <RouterView />
  </div>
</template>