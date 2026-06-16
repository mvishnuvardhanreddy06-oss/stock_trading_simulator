import React from "react";
import { AuthProvider } from "./context/AuthContext.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
