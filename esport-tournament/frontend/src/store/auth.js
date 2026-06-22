import { defineStore } from "pinia";
import api from "../services/api";

export const useAuthStore = defineStore ("auth", {
    state: () => ({
        user: null,
        token: localStorage.getItem("token") || null,
    }),

    actions: {
        async login(email, password) {
            const res = await api.post("/auth/login", {
                email,
                password,
            });

            this.token = res.data.token;
            this.user = res.data.user;

            localStorage.setItem("token", this.token);
        },

        logout() {
            this.token = null;
            this.user = null;
            localStorage.removeItem("token");
        },
    },
});