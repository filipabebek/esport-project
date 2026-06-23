<template>
  <div class="register-page">

    <div class="bg-glow"></div>

    <div class="register-card">

      <div class="logo">
        <img src="/logo.png" alt="logo" />
      </div>

      <h1>Create account</h1>
      <p class="subtitle">Join the eSport Tournament platform</p>

      <div class="form">

        <input
          v-model="username"
          type="text"
          placeholder="Username"
        />

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

        <input
          v-model="confirmPassword"
          type="password"
          placeholder="Confirm password"
        />

        <button @click="register">
          Register
        </button>

        <button class="cancel-btn" @click="cancel">
          Cancel
        </button>

      </div>

      <p class="login-link">
        Already have an account?
        <router-link to="/login">Login</router-link>
      </p>

    </div>

  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import api from "../services/api";

const username = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");

const router = useRouter();

const register = async () => {
  try {
    if (password.value !== confirmPassword.value) {
      alert("Passwords do not match!");
      return;
    }

    await api.post("/auth/register", {
      username: username.value,
      email: email.value,
      password: password.value,
    });

    router.push("/login");
  } catch (err) {
    console.error("Register failed:", err);
  }
};

const cancel = () => {
  router.push("/");
};
</script>

<style scoped>
.register-page {
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
  top: -120px;
  right: -120px;
  border-radius: 50%;
}

.register-card {
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
  font-size: 40px;
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

.login-link {
  margin-top: 15px;
  font-size: 12px;
  opacity: 0.7;
}

.login-link a {
  color: #4BDE4B;
  text-decoration: none;
}
</style>