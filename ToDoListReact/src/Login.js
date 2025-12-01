import React, { useState, useEffect } from "react";
import { api } from "./service";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // בדיקה אם כבר קיים JWT
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // אם יש טוקן, מפנים ישר לדף המשימות
      navigate("/tasks");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // קריאה ל־API להתחברות
      const response = await api.login(username, password);
      //??????????????????????????????
      console.log("=== Response Details ===");
      console.log("response מלא:", response);
      console.log("response.data:", response.data);
      console.log("response.status:", response.status);
      console.log("response.headers:", response.headers);
      //??????????????????????/
      if (response && response.data && response.data.token) {
        // שמירת JWT ב-localStorage
        localStorage.setItem("token", response.data.token);
        console.log("Token saved:", response.data.token);
        
        // הפניה לדף המשימות
        navigate("/tasks");
      } else {
        console.error("No token in response:", response);
        alert("התחברות נכשלה - לא התקבל טוקן");
      }
    } catch (err) {
      console.error("Login error:", err);
      if (err.response) {
        console.error("Response data:", err.response.data);
        console.error("Response status:", err.response.status);
      }
      alert("שם משתמש או סיסמה לא נכונים");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        flexDirection: "column",
        maxWidth: "300px",
        margin: "auto",
        marginTop: "100px"
      }}
    >
      <h2>Login</h2>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
        style={{ marginBottom: "10px", padding: "8px" }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        style={{ marginBottom: "10px", padding: "8px" }}
      />
      <button type="submit" style={{ padding: "10px" }}>
        Login
      </button>
    </form>
  );
}
