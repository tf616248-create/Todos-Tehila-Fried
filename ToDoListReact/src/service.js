// import axios from "axios";

// const apiUrl = `${process.env.REACT_APP_API_URL}/tasks`;

// // יצירת instance של axios
// const apiClient = axios.create({
//   baseURL: apiUrl,
//   // withCredentials: true
// });

// // --- מוסיפים JWT ל־headers אם קיים ---
// apiClient.interceptors.request.use(config => {
//   const token = localStorage.getItem("token"); // שם זהה לשימוש שלך בלוגין
//   if (token) {
//     config.headers["Authorization"] = `Bearer ${token}`;
//   }
//   return config;
// });

// // --- Interceptor לטיפול בשגיאות 401 ---
// apiClient.interceptors.response.use(
//   response => response,
//   error => {
//     if (error.response && error.response.status === 401) {
//       console.warn("Unauthorized! Redirecting to login...");
//       window.location.href = "/login";
//     }
//     return Promise.reject(error);
//   }
// );

// export const api = {
//   // רישום משתמש חדש
//   register(username, password) {
//     return apiClient.post("/users/register", { username, password });
//   },
  
//   // התחברות משתמש
//    login(username, password) {
//   //   // return apiClient.post("/users/login", { username, password }, { withCredentials: true });
//      return apiClient.post("/users/login", { username, password });

//    },

//   // שליפת משימות (דורש JWT)
//   getTasks: async () => {
//     const res = await apiClient.get("/items");
//     return res.data;
//   },

//   // הוספת משימה חדשה
//   addTask: async (name) => {
//     const res = await apiClient.post("/items", { name, isComplete: false });
//     return res.data;
//   },
//   setCompleted: async (id, isComplete) => {
//     return apiClient.patch(`/items/${id}`, { isComplete });
//   },
//   deleteTask: async (id) => {
//     return apiClient.delete(`/items/${id}`);
//   },
// };



import axios from "axios";

// Base URL של ה־backend (ללא /tasks או /users)
const apiUrl = "https://todoapi-iy8f.onrender.com";
console.log("API BASE URL =", apiUrl);

// יצירת instance של axios
const apiClient = axios.create({
  baseURL: apiUrl,
  // withCredentials: true אם צריך
});

// --- מוסיפים JWT ל־headers אם קיים ---
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

// --- Interceptor לטיפול בשגיאות 401 ---
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      console.warn("Unauthorized! Redirecting to login...");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const api = {
  // רישום משתמש חדש
  register(username, password) {
    return apiClient.post("/users/register", { username, password });
  },

  // התחברות משתמש
  login(username, password) {
    return apiClient.post("/users/login", { username, password });
  },

  // שליפת משימות (דורש JWT)
  getTasks: async () => {
    const res = await apiClient.get("/items");
    return res.data;
  },

  // הוספת משימה חדשה
  addTask: async (name) => {
    const res = await apiClient.post("/items", { name, isComplete: false });
    return res.data;
  },

  // סימון משימה כהושלמה
  setCompleted: async (id, isComplete) => {
    return apiClient.patch(`/items/${id}`, { isComplete });
  },

  // מחיקת משימה
  deleteTask: async (id) => {
    return apiClient.delete(`/items/${id}`);
  },
};
