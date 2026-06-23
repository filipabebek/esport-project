<template>
  <div class="login-page">

    <div class="bg-glow"></div>

    <div class="login-card">

      <div class="logo">
        <img src="/logo.png" alt="logo" />
      </div>

      <h1>Welcome back</h1>
      <p class="subtitle">Login to continue your esports journey</p>

      <div class="form">

        <input
          v-model="email"
          type="email"
          placeholder="Email"
        />

        <input
          v-model="password"
          type="password"
          placeholder="Password"
        />

        <button @click="login">
          Login
        </button>

        <button class="cancel-btn" @click="cancel">
          Cancel
        </button>

      </div>

      <p class="register">
        Don't have an account?
        <router-link to="/register">Register</router-link>
      </p>

    </div>

  </div>
</template>

<script setup>
import { ref } from "vue";
import { useAuthStore } from "../store/auth";
import { useRouter } from "vue-router";

const email = ref("");
const password = ref("");

const auth = useAuthStore();
const router = useRouter();

const login = async () => {
  try {
    await auth.login(email.value, password.value);
    router.push("/");
  } catch (err) {
    console.error("Login failed:", err);
  }
};

const cancel = () => {
  router.push("/");
};
</script>

<style scoped>
.login-page {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;

  background: #0b0c10;
  position: relative;
  overflow: hidden;
}

.bg-glow {
  position: absolute;
  width: 600px;
  height: 600px;
  background: rgba(75, 222, 75, 0.15);
  filter: blur(120px);
  top: -150px;
  left: -150px;
  border-radius: 50%;
}

.login-card {
  width: 380px;
  padding: 35px;

  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;

  backdrop-filter: blur(12px);

  color: white;
  text-align: center;

  box-shadow: 0 0 40px rgba(75, 222, 75, 0.08);
  z-index: 2;
}

.logo img {
  height: 55px;
  margin-bottom: 10px;
}

h1 {
  margin: 10px 0 6px;
  font-size: 42px;
  font-weight: 700;
}

.subtitle {
  font-size: 13px;
  opacity: 0.6;
  margin-bottom: 25px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

input {
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);

  background: rgba(255, 255, 255, 0.04);
  color: white;

  outline: none;
  transition: 0.2s;
}

input:focus {
  border-color: #4BDE4B;
  box-shadow: 0 0 15px rgba(75, 222, 75, 0.2);
}

button {
  padding: 12px;
  border: none;
  border-radius: 10px;

  background: #4BDE4B;
  color: black;
  font-weight: bold;

  cursor: pointer;
  transition: 0.2s;
}

button:hover {
  background: #3cc63c;
  transform: translateY(-2px);
}

.cancel-btn {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: white;
}

.cancel-btn:hover {
  background: rgba(255, 255, 255, 0.05);
}

.register {
  margin-top: 15px;
  font-size: 12px;
  opacity: 0.7;
}

.register a {
  color: #4BDE4B;
  text-decoration: none;
}
</style>