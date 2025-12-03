import React, { useState } from "react";
import { api } from "./service";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!username.trim() || !password.trim()) {
      setError("אנא מלא את כל השדות");
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await api.register(username, password);
      if (response && response.data) {
        alert("המשתמש נוצר בהצלחה!");
        const loginRes = await api.login(username, password);
        if (loginRes?.data?.token) {
          localStorage.setItem("token", loginRes.data.token);
          navigate("/tasks"); // עכשיו token כבר נשמר
        } else {
          setError("לא התקבל טוקן לאחר הרישום");
        }
        // navigate("/login");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError(
        err.response?.data?.message || 
        "אירעה שגיאה בעת יצירת המשתמש. אנא נסה שוב."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
  <div style={styles.form}>
    <h2 style={styles.title}>הרשמה</h2>
    
    {error && <div style={styles.error}>{error}</div>}
    
    <input
      type="text"
      placeholder="שם משתמש"
      value={username}
      onChange={(e) => setUsername(e.target.value)}
      style={styles.input}
      dir="rtl"
    />
    
    <input
      type="password"
      placeholder="סיסמה"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      style={styles.input}
      dir="rtl"
    />
    
    <button 
      type="button"
      onClick={handleSubmit}
      style={styles.button}
      disabled={isLoading}
    >
      {isLoading ? 'מבצע הרשמה...' : 'הרשם'}
    </button>
    
    <div style={styles.loginLink}>
      <Link to="/login" style={styles.link}>
        כבר יש לך חשבון? התחבר כאן
      </Link>
    </div>
  </div>
</div>

//     <div style={styles.container}>
//       <form onSubmit={handleSubmit} style={styles.form}>
//         <h2 style={styles.title}>הרשמה</h2>
        
//         {error && <div style={styles.error}>{error}</div>}
        
//         <input
//           type="text"
//           placeholder="שם משתמש"
//           value={username}
//           onChange={(e) => setUsername(e.target.value)}
//           style={styles.input}
//           dir="rtl"
//         />
        
//         <input
//           type="password"
//           placeholder="סיסמה"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           style={styles.input}
//           dir="rtl"
//         />
        
//         <button 
//           type="submit" 
//           style={styles.button}
//           disabled={isLoading}
//         >
//           {isLoading ? 'מבצע הרשמה...' : 'הרשם'}
//         </button>
        
//         <div style={styles.loginLink}>
//         <Link 
//   to="/login" 
//   style={styles.link}
// >
//   כבר יש לך חשבון? התחבר כאן
// </Link>        </div>
//       </form>
//     </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    fontFamily: 'Arial, sans-serif',
  },
  form: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '400px',
    textAlign: 'center',
  },
  title: {
    marginBottom: '20px',
    color: '#333',
  },
  input: {
    width: '100%',
    padding: '12px',
    margin: '10px 0',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px',
  },
  button: {
    width: '100%',
    padding: '12px',
    marginTop: '10px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
    cursor: 'not-allowed',
  },
  error: {
    color: '#e74c3c',
    marginBottom: '15px',
    textAlign: 'center',
  },
  loginLink: {
    marginTop: '15px',
    color: '#666',
  },
  link: {
    color: '#3498db',
    textDecoration: 'none',
  },
};
