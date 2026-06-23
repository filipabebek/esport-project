<template>
  <header class="navbar">

    <!-- LOGO -->
    <router-link to="/" class="logo">
      <img src="/logo.png" alt="Logo" />
    </router-link>

    <!-- Nav u sredini -->
    <nav class="center-nav">
      <router-link
        v-for="item in menuItems"
        :key="item.to"
        :to="item.to"
        class="nav-btn"
      >
        {{ item.title }}
      </router-link>
    </nav>

    <div class="spacer"></div>

    <!-- Desni navbar -->
    <div class="right-actions">

      <!-- NOTIFICATIONS -->
      <button class="icon-btn">
        <i class="mdi mdi-bell"></i>
      </button>

      <!-- User meni -->
      <div class="user-menu">
        <button class="icon-btn">
            <i class="mdi mdi-account-circle"></i>
        </button>

        <div class="dropdown">
          <div class="username">
            {{ authStore.user?.username || "User" }}
          </div>

          <router-link to="/profile">Profil</router-link>
          <router-link to="/settings">Postavke</router-link>
          <button @click="logout">Odjava</button>
        </div>
      </div>

    </div>

    <!-- Meni za mobitele / doraditi i promjeniti -->
    <button class="mobile-menu" @click="drawer = !drawer">
      ☰
    </button>

  </header>

  <!-- Sekcija za mobitele -->
  <div v-if="drawer" class="mobile-drawer">
    <router-link
      v-for="item in menuItems"
      :key="item.to"
      :to="item.to"
      class="mobile-item"
      @click="drawer = false"
    >
      {{ item.title }}
    </router-link>

    <hr />

    <router-link to="/profile">Profil</router-link>
    <button @click="logout">Odjava</button>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../store/auth";

const authStore = useAuthStore();
const router = useRouter();
const drawer = ref(false);

const menuItems = computed(() => {
  const role = authStore.role;
  const isAuth = authStore.isAuthenticated;

  if (!isAuth) {
    return [
      { title: "Home", to: "/" },
      { title: "Tournaments", to: "/tournaments" },
      { title: "Games", to: "/games" },
      { title: "Leaderboard", to: "/leaderboard" },
      { title: "Login", to: "/login" },
      { title: "Registration", to: "/register" },
    ];
  }

  if (role === "player") {
    return [
      { title: "Home", to: "/" },
      { title: "Tournaments", to: "/tournaments" },
      { title: "My Tournaments", to: "/my-tournaments" },
      { title: "Leaderboard", to: "/leaderboard" },
    ];
  }

  if (role === "organizer") {
    return [
      { title: "Dashboard", to: "/dashboard" },
      { title: "Turniri", to: "/tournaments" },
      { title: "Moji turniri", to: "/my-tournaments" },
      { title: "Create tournament", to: "/tournaments/create" },
      { title: "Results", to: "/results" },
    ];
  }

  if (role === "admin") {
    return [
      { title: "Turniri", to: "/tournaments" },
      { title: "Korisnici", to: "/users" },
      { title: "Statistika", to: "/statistics" },
    ];
  }

  return [];
});

function logout() {
  authStore.logout();
  router.push("/login");
}
</script>

<style scoped>
/* MAIN BAR */
.navbar {
  display: flex;
  align-items: center;
  padding: 0 20px;
  height: 60px;
  color: white;
  position: relative;
}

.logo img {
  height: 38px;
  padding-left: 30px;
}

.center-nav {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 12px;
}

.nav-btn {
  color: #4BDE4B;
  text-decoration: none;
  font-weight: 500;
  padding: 6px 10px;
  border-radius: 6px;
  transition: 0.2s;
}

.nav-btn:hover {
  background: rgba(255,255,255,0.2);
  transform: translateY(-1px);
}

.spacer {
  flex: 1;
}

.right-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.icon-btn i {
  color: #4BDE4B;
}

.icon-btn {
  background: transparent;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  position: relative;
  transition: 0.2s;
}

.icon-btn:hover {
  transform: scale(1.15);
}


.user-menu {
  position: relative;
}

.dropdown {
  display: none;
  position: absolute;
  right: 0;
  top: 30px;
  background: white;
  color: black;
  min-width: 150px;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}

.user-menu:hover .dropdown {
  display: block;
}

.dropdown a,
.dropdown button {
  display: block;
  padding: 10px;
  text-decoration: none;
  border: none;
  width: 100%;
  text-align: left;
  background: white;
  cursor: pointer;
}

.dropdown a:hover,
.dropdown button:hover {
  background: #eee;
}

.mobile-menu {
  display: none;
  background: none;
  border: none;
  color: white;
  font-size: 26px;
  cursor: pointer;
}

.mobile-drawer {
  position: fixed;
  top: 60px;
  left: 0;
  width: 200px;
  height: 100%;
  background: white;
  display: flex;
  flex-direction: column;
  padding: 10px;
  gap: 10px;
}

.mobile-item {
  text-decoration: none;
  color: black;
}

@media (max-width: 900px) {
  .center-nav {
    display: none;
  }

  .mobile-menu {
    display: block;
  }
}
</style>