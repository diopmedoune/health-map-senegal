import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import AdminDashboard from './dashboard/AdminDashboard';
import TuteurDashboard from './dashboard/TuteurDashboard';
import UserDashboard from './dashboard/UserDashboard';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {user.role === 'ADMIN' && <AdminDashboard />}
      {user.role === 'TUTEUR' && <TuteurDashboard />}
      {user.role === 'STANDARD' && <UserDashboard />}
    </div>
  );
};

export default Dashboard;