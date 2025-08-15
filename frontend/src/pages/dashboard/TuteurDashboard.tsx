import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Etablissement, Service, CreateEtablissementData } from '../../types';
import { Building2, MapPin, Clock, CheckCircle, Plus, Edit } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Modal from '../../components/ui/Modal';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { Icon, LatLng, latLngBounds } from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  selectedLocation: { lat: number; lng: number } | null;
}

const LocationPicker: React.FC<LocationPickerProps> = ({ onLocationSelect, selectedLocation }) => {
  const MapClickHandler = () => {
    useMapEvents({
      click: (e) => {
        const { lat, lng } = e.latlng;
        onLocationSelect(lat, lng);
      },
    });
    return null;
  };

  return (
    <MapContainer
      center={[14.6928, -17.4467]}
      zoom={11}
      style={{ height: '300px', width: '100%' }}
      className="rounded-lg"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapClickHandler />
      <MapAutoView selectedLocation={selectedLocation} />
      {selectedLocation && (
        <Marker position={[selectedLocation.lat, selectedLocation.lng]} />
      )}
    </MapContainer>
  );
};

const TuteurDashboard: React.FC = () => {
  const [etablissement, setEtablissement] = useState<Etablissement | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<CreateEtablissementData>({
    defaultValues: {
      nom: '',
      adresse: '',
      telephone: '',
      email: '',
      description: '',
      type: 'CENTRE_SANTE',
      serviceIds: [],
    } as any,
  });
  const selectedServiceIds = watch('serviceIds') || [];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (showCreateModal && isEditing && etablissement) {
      const anyEtab: any = etablissement as any;
      reset({
        nom: etablissement.nom,
        adresse: anyEtab.adresse || etablissement.localisation || anyEtab.address || '',
        telephone: anyEtab.telephone || anyEtab.phone || anyEtab.tel || '',
        email: anyEtab.email || anyEtab.mail || '',
        description: anyEtab.description || anyEtab.desc || anyEtab.details || '',
        type: etablissement.type || 'CENTRE_SANTE',
        latitude: etablissement.latitude,
        longitude: etablissement.longitude,
        serviceIds: etablissement.services.map(s => s.id),
      } as any);
      setValue('serviceIds', etablissement.services.map(s => s.id) as any);
      setSelectedLocation({ lat: etablissement.latitude, lng: etablissement.longitude });
    }
  }, [showCreateModal, isEditing, etablissement]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [servicesData] = await Promise.all([
        api.getServices()
      ]);

      setServices(servicesData);

      try {
        const etablissementData = await api.getTuteurEtablissement();
        setEtablissement(etablissementData);
      } catch (error) {
        console.log('Aucun établissement trouvé pour ce tuteur');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateOrUpdate = async (data: CreateEtablissementData) => {
    try {
      if (!selectedLocation) {
        toast.error('Veuillez sélectionner une position sur la carte');
        return;
      }

      const etablissementData: any = {
        ...data,
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lng,
        serviceIds: selectedServiceIds
      };

      if (isEditing && etablissement) {
        etablissementData.id = etablissement.id;
        await api.updateEtablissement(etablissementData);
        toast.success('Établissement mis à jour avec succès');
        setShowCreateModal(false);
        setIsEditing(false);
      } else {
        await api.createEtablissement(etablissementData);
        toast.success('Établissement créé avec succès');
      }

      setShowCreateModal(false);
      setIsEditing(false);
      reset();
      setSelectedLocation(null);
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'opération');
    }
  };

  const openEditModal = () => {
    if (!etablissement) return;

    setIsEditing(true);
    setShowCreateModal(true);
    setSelectedLocation({ lat: etablissement.latitude, lng: etablissement.longitude });

    reset({
      nom: etablissement.nom,
      adresse: etablissement.adresse || etablissement.localisation,
      telephone: etablissement.telephone || '',
      email: etablissement.email || '',
      description: etablissement.description || '',
      type: etablissement.type || 'CENTRE_SANTE',
      latitude: etablissement.latitude,
      longitude: etablissement.longitude,
      serviceIds: etablissement.services.map(s => s.id),
    } as any);
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setShowCreateModal(true);
    setSelectedLocation(null);
    reset({
      nom: '',
      adresse: '',
      telephone: '',
      email: '',
      description: '',
      type: 'CENTRE_SANTE',
      serviceIds: [],
    } as any);
  };

  const handleServiceToggle = (serviceId: number) => {
    const currentServices = selectedServiceIds;
    const newServices = currentServices.includes(serviceId)
      ? currentServices.filter(id => id !== serviceId)
      : [...currentServices, serviceId];
    
    setValue('serviceIds', newServices);
  };

  const establishmentTypes = [
    { value: 'HOPITAL', label: 'Hôpital' },
    { value: 'CLINIQUE', label: 'Clinique' },
    { value: 'CENTRE_SANTE', label: 'Centre de Santé' },
    { value: 'POSTE_SANTE', label: 'Poste de Santé' },
    { value: 'PHARMACIE', label: 'Pharmacie' }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord tuteur</h1>
          <p className="text-gray-600">Gérez votre établissement de santé</p>
        </div>
        {!etablissement ? (
          <button
            onClick={openCreateModal}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
            <span>Créer un établissement</span>
          </button>
        ) : (
          <button
            onClick={openEditModal}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Edit size={16} />
            <span>Modifier</span>
          </button>
        )}
      </div>

      {etablissement ? (
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Mon établissement</h2>
              <div className="flex items-center space-x-2">
                {etablissement.statut === 'VALIDE' ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                      Validé
                    </span>
                  </>
                ) : etablissement.statut === 'EN_ATTENTE' ? (
                  <>
                    <Clock className="w-5 h-5 text-yellow-600" />
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
                      En attente
                    </span>
                  </>
                ) : (
                  <>
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-sm rounded-full">
                      Refusé
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{etablissement.nom}</h3>
                <div className="space-y-2 text-gray-600">
                  <div className="flex items-center space-x-2">
                    <MapPin size={16} />
                    <span>{etablissement.localisation}</span>
                  </div>
                  {etablissement.telephone && (
                    <div className="flex items-center space-x-2">
                      <span>📞</span>
                      <span>{etablissement.telephone}</span>
                    </div>
                  )}
                  {etablissement.email && (
                    <div className="flex items-center space-x-2">
                      <span>✉️</span>
                      <span>{etablissement.email}</span>
                    </div>
                  )}
                </div>

                {etablissement.services.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-900 mb-2">Services disponibles:</h4>
                    <div className="flex flex-wrap gap-2">
                      {etablissement.services.map((service) => (
                        <span
                          key={service.id}
                          className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                        >
                          {service.nom}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Position géographique</h4>
                <MapContainer
                  center={[etablissement.latitude, etablissement.longitude]}
                  zoom={15}
                  style={{ height: '200px', width: '100%' }}
                  className="rounded-lg"
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={[etablissement.latitude, etablissement.longitude]} />
                </MapContainer>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun établissement</h3>
          <p className="text-gray-600 mb-4">
            Vous n'avez pas encore créé d'établissement. Commencez par créer votre premier établissement de santé.
          </p>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Créer un établissement
          </button>
        </div>
      )}

      {/* Modal pour créer/modifier un établissement */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title={isEditing ? 'Modifier l\'établissement' : 'Créer un établissement'}
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit(handleCreateOrUpdate)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom de l'établissement
              </label>
              <input
                {...register('nom', { required: 'Le nom est requis' })}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.nom && <p className="text-sm text-red-600 mt-1">{errors.nom.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type d'établissement
              </label>
              <select
                {...register('type', { required: 'Le type est requis' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Sélectionnez un type</option>
                {establishmentTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              {errors.type && <p className="text-sm text-red-600 mt-1">{errors.type.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adresse complète
            </label>
            <input
              {...register('adresse', { required: 'L\'adresse est requise' })}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.adresse && <p className="text-sm text-red-600 mt-1">{errors.adresse.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Téléphone
              </label>
              <input
                {...register('telephone', { required: 'Le téléphone est requis' })}
                type="tel"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.telephone && <p className="text-sm text-red-600 mt-1">{errors.telephone.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                {...register('email', { 
                  required: 'L\'email est requis',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Email invalide'
                  }
                })}
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Services disponibles
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto p-2 border border-gray-200 rounded-lg">
              {services.map((service) => (
                <label key={service.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedServiceIds.includes(service.id)}
                    onChange={() => handleServiceToggle(service.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{service.nom}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Position géographique
            </label>
            <p className="text-sm text-gray-600 mb-2">
              Cliquez sur la carte pour sélectionner l'emplacement de votre établissement
            </p>
            <LocationPicker 
              onLocationSelect={(lat, lng) => setSelectedLocation({ lat, lng })}
              selectedLocation={selectedLocation}
            />
            {selectedLocation && (
              <p className="text-sm text-green-600 mt-1">
                Position sélectionnée: {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
              </p>
            )}
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {isEditing ? 'Mettre à jour' : 'Créer l\'établissement'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TuteurDashboard;

const MapAutoView: React.FC<{ selectedLocation: { lat: number; lng: number } | null }> = ({ selectedLocation }) => {
  const map = useMap();
  React.useEffect(() => {
    if (selectedLocation) {
      map.setView([selectedLocation.lat, selectedLocation.lng], 13);
      return;
    }
    const senegalBounds = latLngBounds([[12.0, -17.7], [16.7, -11.4]]);
    map.fitBounds(senegalBounds, { padding: [20, 20] });
  }, [selectedLocation, map]);
  return null;
};