<template>
  <header class="navbar">

    <router-link to="/" class="logo">
      <img src="/logo.png" alt="Logo" />
    </router-link>

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

    <div class="right-actions">

      <div v-if="authStore.isAuthenticated" class="user-menu">

  <button class="profile-btn">
    <i class="mdi mdi-account-circle"></i>

    <span>
      {{ authStore.user?.username || "User" }}
    </span>

    <i class="mdi mdi-chevron-down dropdown-arrow"></i>
  </button>

  <div class="dropdown">

    <div class="profile-info">
      <i class="mdi mdi-account-circle"></i>

      <div>
        <div class="username">
          {{ authStore.user?.username || "User" }}
        </div>

        <div class="user-role">
          {{ authStore.role }}
        </div>
      </div>
    </div>

    <div class="dropdown-line"></div>

    <router-link to="/profile">
      <i class="mdi mdi-account-outline"></i>
      Profil
    </router-link>

    <button @click="logout" class="logout-btn">
      <i class="mdi mdi-logout"></i>
      Odjava
    </button>

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
      { title: "Login", to: "/login" },
      { title: "Registration", to: "/register" },
    ];
  }

  if (role === "player") {
    return [
      { title: "Home", to: "/" },
      { title: "Tournaments", to: "/tournaments" },
      { title: "My Tournaments", to: "/my-tournaments" },
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
  router.push("/");
}
</script>

<style scoped>
.navbar {
  display: flex;
  align-items: center;
  padding: 0 20px;
  height: 65px;

  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;

  background: transparent;
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
  color: rgba(255,255,255,0.75);
  text-decoration: none;
  font-weight: 500;
  padding: 6px 10px;
  border-radius: 6px;
  transition: 0.2s;
}

.nav-btn:hover {
  color: #4BDE4B;
  background: rgba(75, 222, 75, 0.08);
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
  color: rgba(255,255,255,0.8);
}

.icon-btn:hover i {
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
  transform: translateY(-1px);
}

.user-menu {
  position: relative;
}

.user-menu:hover .dropdown {
  visibility: visible;
  opacity: 1;
  transform: translateY(0);
}

.user-menu:hover .dropdown-arrow {
  transform: rotate(180deg);
}

.profile-btn {
  display: flex;
  align-items: center;
  gap: 7px;
  background: transparent;
  border: none;
  color: rgba(255,255,255,0.8);
  font: inherit;
  cursor: pointer;
  padding: 6px 8px;
  border-radius: 6px;
  transition: 0.2s;
}

.profile-btn:hover {
  color: #4BDE4B;
  background: rgba(75, 222, 75, 0.08);
}

.profile-btn .mdi-account-circle {
  font-size: 21px;
}

.profile-info {
  display: flex;
  align-items: center;
  gap: 9px;

  padding: 7px;
}

.profile-info > i {
  font-size: 25px;
  color: #4BDE4B;
}

.username {
  color: white;
  font-weight: 500;
}

.user-role {
  color: rgba(255,255,255,0.4);
  font-size: 12px;
  margin-top: 1px;
  text-transform: capitalize;
}

.dropdown-line {
  height: 1px;
  background: rgba(255,255,255,0.08);
  margin: 4px 0;
}

.dropdown {
  visibility: hidden;
  opacity: 0;
  position: absolute;
  right: 0;
  top: calc(100% + 6px);
  min-width: 180px;
  background: rgba(20,20,25,0.96);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 8px;
  padding: 7px;
  box-shadow: 0 8px 25px rgba(0,0,0,0.3);
  transform: translateY(-4px);
  transition:
    opacity 0.2s,
    transform 0.2s,
    visibility 0.2s;
}

.dropdown-arrow {
  font-size: 15px;
  color: rgba(255,255,255,0.5);
  transition: transform 0.2s;
}

.dropdown a,
.dropdown button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px;
  text-decoration: none;
  border: none;
  border-radius: 5px;
  width: 100%;
  text-align: left;
  background: transparent;
  color: rgba(255,255,255,0.8);
  font: inherit;
  cursor: pointer;
  box-sizing: border-box;
  transition: 0.2s;
}

.dropdown a:hover {
  color: #4BDE4B;
  background: rgba(75,222,75,0.1);
}

.logout-btn:hover {
  color: #ff6464 !important;
  background: rgba(255,100,100,0.08) !important;
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