import { useState, useEffect, type Dispatch, type SetStateAction, type ReactElement } from 'react';
import Welcome from './pages/welcome/main/Welcome';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard/main/index';
import { getToken, clearToken, validateSession } from './services/authService';
import './App.css';

export type SetIsSignedIn = Dispatch<SetStateAction<boolean>>;

function App() {
  // The JWT in localStorage is the source of truth: its presence renders the
  // dashboard immediately, and the effect below reconciles it with the server.
  const [isSignedIn, setIsSignedIn] = useState<boolean>(() => !!getToken());

  useEffect(() => {
    if (!getToken()) return;
    // Drop a stored-but-rejected token (e.g. expired) so we don't show a broken
    // dashboard whose every request 401s.
    validateSession().then((valid) => {
      if (!valid) {
        clearToken();
        setIsSignedIn(false);
      }
    });
  }, []);

  const PrivateRoute = ({ children }: { children: ReactElement }) => {
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
              <Dashboard setIsSignedIn={setIsSignedIn} />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
