import axios from "axios";

const api = anxios.create({
    baseURL: "http://localhost:5000/api",
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if(token){
        config.headers.Autorization = `Bearer ${token}`;
    }

    return config;
});

export default api;