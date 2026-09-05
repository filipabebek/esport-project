import { defineStore } from "pinia";
import api from "../services/api";

export const useAuthStore = defineStore("auth", {
    state: () => ({
        user: JSON.parse(localStorage.getItem("user")) || null,
        token: localStorage.getItem("token") || null,
    }),

    getters: {
        isAuthenticated: (state) => !!state.token,
        role: (state) => state.user?.role || null,
        isOrganizer: (state) => state.user?.role === "organizer",
        isAdmin: (state) => state.user?.role === "admin",
    },

    actions: {
        setAuth(data) {
            this.token = data.token;
            this.user = data.user;

            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
        },

        async login(email, password) {
            const res = await api.post("/auth/login", {
                email,
                password,
            });

            this.setAuth(res.data);
        },

        logout() {
            this.token = null;
            this.user = null;

            localStorage.removeItem("token");
            localStorage.removeItem("user");
        },
    },
});