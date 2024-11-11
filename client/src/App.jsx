import React, { useState, useEffect } from 'react';
import Welcome from './pages/welcome/main/Welcome'
import { BrowserRouter as  Router, Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard/main/index'
import './App.css'

function App() {
  const [isSignedIn, setIsSignedIn] = useState(() => {
    return JSON.parse(localStorage.getItem('isSignedIn')) || false;
  });

  // Update localStorage when `isSignedIn` changes
  useEffect(() => {
    localStorage.setItem('isSignedIn', JSON.stringify(isSignedIn));
  }, [isSignedIn]);
  
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
