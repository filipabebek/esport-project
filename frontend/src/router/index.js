import { createRouter, createWebHistory } from "vue-router";

import Login from "../views/Login.vue";
import Register from "../views/Register.vue";
import Dashboard from "../views/Dashboard.vue";
import Tournaments from "../views/Tournaments.vue";

const routes = [
    { path: "/", component: Login },
    { path: "register", component: Register },
    { path: "/dashboard", component: Dashboard },
    { path: "tournaments", component: Tournaments },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;