<template>
  <div>
    <h1>Register</h1>

    <input v-model="username" placeholder="Username" />
    <input v-model="email" placeholder="Email" />
    <input v-model="password" type="password" placeholder="Password" />

    <button @click="register">Register</button>
  </div>
</template>

<script setup>
import { ref } from "vue";
import api from "../services/api";
import { useRouter } from "vue-router";

const username = ref("");
const email = ref("");
const password = ref("");

const router = useRouter();

const register = async () => {
  await api.post("/auth/register", {
    username: username.value,
    email: email.value,
    password: password.value,
  });

  router.push("/");
};
</script>