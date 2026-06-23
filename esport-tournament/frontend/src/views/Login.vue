<template>
  <div class="login-page">

    <div class="login-card">

      <div class="logo">
        <img src="/logo.png" alt="logo" />
      </div>

      <h1>Welcome back</h1>
      <p class="subtitle">Login to continue to eSport Tournament</p>

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

        <button @click="login">Login</button>

        <button class="cabcek-btn" @click="cancel">Cancel</button>

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

  background: radial-gradient(circle at top, #1a1a2e, #0f0f14);
}

.login-card {
  width: 380px;
  padding: 35px;

  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);

  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;

  color: white;
  text-align: center;

  box-shadow: 0 0 30px rgba(124, 77, 255, 0.15);
}

.logo img {
  height: 50px;
  margin-bottom: 10px;
}

h1 {
  margin: 10px 0 5px;
  font-size: 49px;
}

.subtitle {
  font-size: 12px;
  opacity: 0.7;
  margin-bottom: 20px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

input {
  padding: 12px;
  border-radius: 8px;
  border: none;
  outline: none;

  background: rgba(255, 255, 255, 0.08);
  color: white;
}

input:focus {
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid #7c4dff;
}

button {
  margin-top: 10px;
  padding: 12px;

  border: none;
  border-radius: 8px;

  background: #7c4dff;
  color: white;
  font-weight: bold;

  cursor: pointer;
  transition: 0.2s;
}

button:hover {
  background: #5e35b1;
  transform: translateY(-2px);
}

.register {
  margin-top: 15px;
  font-size: 12px;
  opacity: 0.7;
}

.register a {
  color: #7c4dff;
}
</style>