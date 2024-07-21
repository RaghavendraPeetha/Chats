import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, Outlet, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import LogoutButton from './components/LogoutButton';
import ConversationsList from './components/ConversationsList';
import ChatWindow from './components/ChatWindow';
import './App.css'; // Import the CSS file for styling

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/conversations" element={<PrivateRoute component={ConversationsList} />} />
            <Route path="/conversations/:id/*" element={<PrivateRoute component={ChatWindow} />} />
          </Route>
          <Route path="/logout" element={<LogoutButton />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

const PrivateRoute = ({ component: Component }) => {
  const { token } = useAuth();
  return token ? <Component /> : <Navigate to="/login" />;
};

const PublicRoute = () => {
  const { token } = useAuth();
  return token ? <Navigate to="/" /> : <Outlet />;
};

const ProtectedRoute = () => {
  const { token } = useAuth();
  return token ? <Outlet /> : <Navigate to="/login" />;
};

const Home = () => {
  const { logout,user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };


  return (
    <div className="home-container">
      <div className="welcome-section">
        <h1 className="welcome-title">Welcome to the Messaging App {user?.username}</h1>
        <button className="logout-button" onClick={handleLogout}>Logout</button>
      </div>
      <div className="conversations-link">
        <Link className="link" to="/conversations">Go to Conversations</Link>
      </div>
    </div>
  );
};

export default App;
