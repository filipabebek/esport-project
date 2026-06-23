import { createRouter, createWebHistory } from "vue-router";

import Login from "../views/Login.vue";
import Register from "../views/Register.vue";
import Dashboard from "../views/Dashboard.vue";
import Tournaments from "../views/Tournaments.vue";
import HomePage from "../views/HomePage.vue";

import MyTournamentsPage from "../views/MyTournamentsPage.vue";
import CreateTournamentPage from "../views/CreateTournamentPage.vue";
import UsersPage from "../views/UsersPage.vue";
import StatisticsPage from "../views/StatisticsPage.vue";

const router = createRouter ({
  history: createWebHistory(),
  routes: [
  { path: "/", component: HomePage },
  { path: "/home", component: HomePage },
  { path: "/login", component: Login, meta: {hideNavbar: true} },
  { path: "/register", component: Register, meta: {hideNavbar: true} },
  { path: "/dashboard", component: Dashboard },
  { path: "/tournaments", component: Tournaments },

  { path: "/my-tournaments", component: MyTournamentsPage },
  { path: "/tournaments/create", component: CreateTournamentPage },
  { path: "/users", component: UsersPage },
  { path: "/statistics", component: StatisticsPage },
]});


export default router;