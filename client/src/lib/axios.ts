import axios from "axios";

const instance = axios.create({
  baseURL: process.env.basePath ?? "http://localhost:8000/api/v1",
  timeout: 10000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add interceptors de xu ly loi
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log("API ERROR", error);
    if (error.code === "ERROR") {
      console.log("401 ERROR");
    }
    return Promise.reject(error);
  }
);

export default instance;
