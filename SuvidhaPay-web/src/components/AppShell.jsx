import React from 'react';

const roleLabels = {
  admin: 'Admin',
  agent: 'Agent',
};

export function AppShell({
  user,
  logout,
  view,
  onNavigate,
  children,
}) {
  const isAdmin = user?.role === 'admin';
  const activeView = view === 'vehicle' ? 'vehicles' : view;

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <div className="dashboard__header-row">
          <div>
            <p className="eyebrow">Municipal Collection Management</p>
            <h1>SuvidhaPay</h1>
          </div>
          <div className="dashboard__user">
            <div>
              <strong>{user?.fullName || user?.email}</strong>
              <span>{roleLabels[user?.role] || user?.role}</span>
            </div>
            <button type="button" onClick={logout}>Logout</button>
          </div>
        </div>
        <nav className="nav-tabs" aria-label="Primary">
          <button
            type="button"
            className={activeView === 'vehicles' ? 'is-active' : ''}
            onClick={() => onNavigate('vehicles')}
          >
            Vehicles
          </button>
          {isAdmin && (
            <button
              type="button"
              className={activeView === 'rates' ? 'is-active' : ''}
              onClick={() => onNavigate('rates')}
            >
              Rate Master
            </button>
          )}
          <button
            type="button"
            className={activeView === 'dues' ? 'is-active' : ''}
            onClick={() => onNavigate('dues')}
          >
            Dues
          </button>
        </nav>
      </header>
      {children}
    </div>
  );
}

