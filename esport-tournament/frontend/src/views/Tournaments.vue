<template>
  <div>
    <h1></h1>

    <div v-for="t in tournaments" :key="t._id">
      <h3>{{ t.name }}</h3>
      <p>{{ t.game }}</p>
      <button @click="join(t._id)">Join</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "../services/api";

const tournaments = ref([]);

const load = async () => {
  const res = await api.get("/tournaments");
  tournaments.value = res.data;
};

const join = async (id) => {
  alert("Backend enroll spajam KASNIJE!!");
};

onMounted(load);
</script>