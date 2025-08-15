import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { MapPin, Star, MessageCircle } from 'lucide-react';

const UserDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord utilisateur</h1>
        <p className="text-gray-600">Bienvenue, {user?.prenom} {user?.nom}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <MapPin className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Établissements visités</p>
              <p className="text-2xl font-bold text-gray-900">12</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avis donnés</p>
              <p className="text-2xl font-bold text-gray-900">8</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <MessageCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Commentaires</p>
              <p className="text-2xl font-bold text-gray-900">15</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Mes avis récents</h2>
        </div>
        <div className="p-6">
          <div className="text-center text-gray-500">
            <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p>Vous n'avez pas encore donné d'avis.</p>
            <p className="text-sm mt-2">
              Visitez la carte pour découvrir des établissements et partager votre expérience.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Établissements favoris</h2>
        </div>
        <div className="p-6">
          <div className="text-center text-gray-500">
            <Star className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p>Aucun favori pour le moment.</p>
            <p className="text-sm mt-2">
              Ajoutez des établissements à vos favoris depuis la carte interactive.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;