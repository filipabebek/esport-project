import { createRouter, createWebHistory } from "vue-router";

import Login from "../views/Login.vue";
import Register from "../views/Register.vue";
import Dashboard from "../views/Dashboard.vue";
import Tournaments from "../views/Tournaments.vue";
import HomePage from "../views/HomePage.vue";
import Games from "../views/Games.vue";

import MyTournamentsPage from "../views/MyTournamentsPage.vue";
import CreateTournamentPage from "../views/CreateTournamentPage.vue";
import UsersPage from "../views/UsersPage.vue";
import StatisticsPage from "../views/StatisticsPage.vue";

import Profile from "../views/Profile.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: HomePage },
    { path: "/home", component: HomePage },
    { path: "/tournaments", component: Tournaments },
    { path: "/games", component: Games },
    { path: "/login", component: Login, meta: { hideNavbar: true } },
    { path: "/register", component: Register, meta: { hideNavbar: true } },

    { path: "/profile", component: Profile },

    { path: "/dashboard", component: Dashboard, meta: { requiresAuth: true } },
    { path: "/my-tournaments", component: MyTournamentsPage, meta: { requiresAuth: true } },

    { path: "/tournaments/create", component: CreateTournamentPage, meta: { requiresAuth: true, roles: ["organizer", "admin"] } },

    { path: "/users", component: UsersPage, meta: { requiresAuth: true, roles: ["admin"] } },
    { path: "/statistics", component: StatisticsPage, meta: { requiresAuth: true, roles: ["admin"] } },
  ]
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const isAuthenticated = !!token;

  if (to.meta.requiresAuth && !isAuthenticated) {
    return next("/login");
  }
  if (to.meta.roles) {
    const allowedRoles = to.meta.roles;

    if (!user || !allowedRoles.includes(user.role)) {
      return next("/dashboard");
    }
  }
  next();
});


export default router;