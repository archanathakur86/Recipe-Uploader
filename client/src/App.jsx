import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import SignIn from './components/Auth/SignIn';
import SignUp from './components/Auth/SignUp';
import Dashboard from './components/Dashboard';
import RecipeView from './components/RecipeView';
import api from './services/api';

export default function App() {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
  }, [user]);

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    navigate('/signin');
  };

  return (
    <div className="app">
      <header className="topbar">
        <Link to="/" className="logo">RecipeShare</Link>
        <nav>
          {user ? (
            <>
              <span className="greet">Hi, {user.name}</span>
              <button onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/signin">Sign In</Link>
              <Link to="/signup">Sign Up</Link>
            </>
          )}
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Dashboard user={user} />} />
          <Route path="/signin" element={<SignIn onAuth={setUser} />} />
          <Route path="/signup" element={<SignUp onAuth={setUser} />} />
          <Route path="/recipe/:id" element={<RecipeView user={user} />} />
        </Routes>
      </main>
    </div>
  );
}