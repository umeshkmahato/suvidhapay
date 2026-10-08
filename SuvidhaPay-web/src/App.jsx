import React, { useState } from 'react';
import './App.css';
import { LoginForm } from './components/AuthForms';
import { AppShell } from './components/AppShell';
import { useAuthStore } from './contexts/store';
import { Dashboard } from './pages/dashboard/Dashboard';
import { DuesPage } from './pages/dues/DuesPage';
import { RateMasterPage } from './pages/rates/RateMasterPage';
import { VehicleDetailPage } from './pages/vehicles/VehicleDetailPage';

function App() {
  const { accessToken, user, logout } = useAuthStore();
  const [view, setView] = useState('vehicles');
  const [vehicleId, setVehicleId] = useState(null);
  const [dueVehicleId, setDueVehicleId] = useState('');

  if (!accessToken) {
    return (
      <div className="app-root">
        <LoginForm />
      </div>
    );
  }

  const openVehicle = (id) => {
    setVehicleId(id);
    setView('vehicle');
  };

  const openDueForVehicle = (id) => {
    setVehicleId(id);
    setDueVehicleId(id);
    setView('dues');
  };

  const navigate = (nextView) => {
    if (nextView !== 'dues') {
      setDueVehicleId('');
    }
    setView(nextView);
  };

  return (
    <div className="app-root">
      <AppShell user={user} logout={logout} view={view} onNavigate={navigate}>
        {view === 'vehicles' && <Dashboard onOpenVehicle={openVehicle} />}
        {view === 'rates' && user?.role === 'admin' && <RateMasterPage />}
        {view === 'dues' && (
          <DuesPage initialVehicleId={dueVehicleId} onOpenVehicle={openVehicle} />
        )}
        {view === 'vehicle' && (
          <VehicleDetailPage
            vehicleId={vehicleId}
            onBack={() => setView('vehicles')}
            onCreateDue={user?.role === 'admin' ? openDueForVehicle : null}
          />
        )}
      </AppShell>
    </div>
  );
}

export default App;
