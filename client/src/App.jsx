import React, { useState } from 'react';
import Welcome from './pages/welcome/main/Welcome'
import { BrowserRouter as  Router, Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard/main/index'
import './App.css'

function App() {
  //  tracking if the user is signed in
  const [isSignedIn, setIsSignedIn] = useState(false);

  // PrivateRoute component that checks authentication
  const PrivateRoute = ({ children }) => {
    return isSignedIn ? children : <Navigate to="/" />;
  };

  return (
    <Router future={{ v7_relativeSplatPath: true }}>
      <Routes>
        <Route 
          path="/" 
          element={<Welcome setIsSignedIn={setIsSignedIn} />} 
        />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  )
}

export default App
