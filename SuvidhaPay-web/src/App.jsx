import React from 'react';
import './App.css';
import { LoginForm } from './components/AuthForms';
import { Dashboard } from './pages/dashboard/Dashboard';
import { useAuthStore } from './contexts/store';

function App() {
  const { accessToken } = useAuthStore();

  return <div className="app-root">{accessToken ? <Dashboard /> : <LoginForm />}</div>;
}

export default App;
