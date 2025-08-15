import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon, LatLngTuple, latLngBounds } from 'leaflet';
import { Etablissement, Service, Avis } from '../../types';
import { api } from '../../services/api';
import { MapPin, Phone, Mail, Star, Filter } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';
import Modal from '../ui/Modal';
import toast from 'react-hot-toast';
import 'leaflet/dist/leaflet.css';

delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const createCustomIcon = (type: string, color: string) => new Icon({ 
  iconUrl: `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
      <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" fill="${color}"/>
      <circle cx="12" cy="12" r="8" fill="white" stroke="${color}" stroke-width="2"/>
      <text x="12" y="16" text-anchor="middle" fill="${color}" font-size="12" font-weight="bold">
        ${type === 'HOPITAL' ? 'H' : type === 'CLINIQUE' ? 'C' : 'S'}
      </text>
    </svg>
  `)}`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

interface FilterState {
  services: number[];
  types: string[];
  searchTerm: string;
}

const InteractiveMap: React.FC = () => {
  const { user } = useAuth();
  const [etablissements, setEtablissements] = useState<Etablissement[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [filteredEtablissements, setFilteredEtablissements] = useState<Etablissement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    services: [],
    types: [],
    searchTerm: ''
  });

	const [isDetailsOpen, setIsDetailsOpen] = useState(false);
	const [selectedEtablissement, setSelectedEtablissement] = useState<Etablissement | null>(null);
	const [avis, setAvis] = useState<Avis[]>([]);
	const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [reviewNote, setReviewNote] = useState<number>(0);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);
	const [isReviewFormOpen, setIsReviewFormOpen] = useState<boolean>(false);
  const [selectedServiceForReview, setSelectedServiceForReview] = useState<number | ''>('');

  const center: LatLngTuple = [14.6928, -17.4467];
  const filtersRef = useRef<HTMLDivElement | null>(null);
  const [filtersHeight, setFiltersHeight] = useState<number>(0);
  const NAVBAR_HEIGHT_PX = 64; // approximation of h-16

  useEffect(() => {
    loadData();
  }, []);


  useEffect(() => {
    const measure = () => {
      if (filtersRef.current) {
        setFiltersHeight(filtersRef.current.getBoundingClientRect().height);
      }
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [showFilters]);

  useEffect(() => {
    applyFilters();
  }, [etablissements, filters]);

  const loadData = async () => {
    try {
      setIsLoading(true);
			const [etablissementsData, servicesData] = await Promise.all([
				api.getEtablissementsAll(),
				api.getServices()
			]);
      
      setEtablissements(etablissementsData);
      setServices(servicesData);
      setFilteredEtablissements(etablissementsData);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  };

	const openDetails = async (etablissement: Etablissement) => {
		setSelectedEtablissement(etablissement);
		setIsDetailsOpen(true);
		setIsDetailsLoading(true);
		setIsReviewFormOpen(false);
		try {
			try {
				const full = await api.getEtablissementById(etablissement.id);
				setSelectedEtablissement(full);
			} catch (_) {
			}
			const fetchedAvis = await api.getAvisByEtablissement(etablissement.id);
			setAvis(fetchedAvis);
		} catch (e) {
			console.error(e);
			toast.error("Impossible de charger les détails de l'établissement");
		} finally {
			setIsDetailsLoading(false);
		}
	};

  const applyFilters = () => {
    let filtered = [...etablissements];

    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(etab => 
        etab.nom.toLowerCase().includes(searchLower) ||
        etab.localisation.toLowerCase().includes(searchLower)
      );
    }

    if (filters.services.length > 0) {
      filtered = filtered.filter(etab =>
        etab.services.some(service => filters.services.includes(service.id))
      );
    }

    if (filters.types.length > 0) {
      filtered = filtered.filter(etab =>
        filters.types.includes(etab.type || 'CENTRE_SANTE')
      );
    }

    setFilteredEtablissements(filtered);
  };

	const handleStartReview = () => {
		const current = window.location.pathname + window.location.search + window.location.hash;
		if (!user) {
			setIsDetailsOpen(false);
			window.location.href = `/login?redirect=${encodeURIComponent(current)}`;
			return;
		}
		setIsReviewFormOpen(true);
	};

  const submitReview = async () => {
    if (!user) {
      const current = window.location.pathname + window.location.search + window.location.hash;
      setIsDetailsOpen(false);
      window.location.href = `/login?redirect=${encodeURIComponent(current)}`;
      return;
    }
    if (!selectedEtablissement) return;
    if (!reviewNote) {
      toast.error('Veuillez sélectionner une note');
      return;
    }
    try {
      setIsSubmittingReview(true);
      if (!selectedServiceForReview || Number.isNaN(Number(selectedServiceForReview))) {
        toast.error('Veuillez sélectionner un service');
        return;
      }
      await api.createAvis(selectedEtablissement.id, reviewNote, reviewComment, Number(selectedServiceForReview));
      const refreshed = await api.getAvisByEtablissement(selectedEtablissement.id);
      setAvis(refreshed);
      setReviewNote(0);
      setReviewComment('');
      setSelectedServiceForReview('');
      toast.success('Avis envoyé');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Impossible d'envoyer l'avis");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleServiceFilter = (serviceId: number) => {
    setFilters(prev => ({
      ...prev,
      services: prev.services.includes(serviceId)
        ? prev.services.filter(id => id !== serviceId)
        : [...prev.services, serviceId]
    }));
  };

  const handleTypeFilter = (type: string) => {
    setFilters(prev => ({
      ...prev,
      types: prev.types.includes(type)
        ? prev.types.filter(t => t !== type)
        : [...prev.types, type]
    }));
  };

  const clearFilters = () => {
    setFilters({
      services: [],
      types: [],
      searchTerm: ''
    });
  };

  const getEstablishmentIcon = (etablissement: Etablissement) => {
    const type = etablissement.type || 'CENTRE_SANTE';
    const colors = {
      HOPITAL: '#dc2626',
      CLINIQUE: '#2563eb', 
      CENTRE_SANTE: '#16a34a',
      POSTE_SANTE: '#ca8a04',
      PHARMACIE: '#9333ea'
    };
    
    return createCustomIcon(type, colors[type as keyof typeof colors]);
  };

  const resolveReviewServiceName = (a: any): string | undefined => {
    const sid = Number(a?.serviceId ?? a?.service_id ?? a?.service?.id);
    if (Number.isFinite(sid)) {
      const fromSelected = selectedEtablissement?.services?.find((s: any) => Number(s?.id) === sid)?.nom;
      if (fromSelected) return fromSelected;
      const fromGlobal = services.find((s: any) => Number(s?.id) === sid)?.nom;
      if (fromGlobal) return fromGlobal;
    }
    return a?.service?.nom;
  };

  const establishmentTypes = [
    { value: 'HOPITAL', label: 'Hôpital', color: 'bg-red-100 text-red-800' },
    { value: 'CLINIQUE', label: 'Clinique', color: 'bg-blue-100 text-blue-800' },
    { value: 'CENTRE_SANTE', label: 'Centre de Santé', color: 'bg-green-100 text-green-800' },
    { value: 'POSTE_SANTE', label: 'Poste de Santé', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'PHARMACIE', label: 'Pharmacie', color: 'bg-purple-100 text-purple-800' }
  ];

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="relative">
      <div ref={filtersRef} className="sticky top-16 left-0 right-0 z-[1000] bg-white rounded-lg shadow-lg p-4 mx-4">
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Rechercher un établissement ou une ville..."
              value={filters.searchTerm}
              onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Filter size={16} />
            <span>Filtres</span>
          </button>
        </div>

        {showFilters && (
          <div className="space-y-4 pt-4 border-t border-gray-200 max-h-[60vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">Filtres avancés</h3>
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Effacer tout
              </button>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Types d'établissements</h4>
              <div className="flex flex-wrap gap-2">
                {establishmentTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => handleTypeFilter(type.value)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      filters.types.includes(type.value)
                        ? type.color + ' ring-2 ring-offset-1 ring-gray-300'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Services disponibles</h4>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {services.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => handleServiceFilter(service.id)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      filters.services.includes(service.id)
                        ? 'bg-green-100 text-green-800 ring-2 ring-offset-1 ring-green-300'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {service.nom}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 text-sm text-gray-600">
          {filteredEtablissements.length} établissements trouvés
        </div>
      </div>

      <MapContainer
        center={center}
        zoom={11}
        style={{ height: `calc(100vh - ${NAVBAR_HEIGHT_PX + filtersHeight}px)`, width: '100%' }}
        className="z-0"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <MapAutoView etablissements={etablissements} />
        
        {filteredEtablissements.map((etablissement) => (
          <Marker
            key={etablissement.id}
            position={[etablissement.latitude, etablissement.longitude]}
            icon={getEstablishmentIcon(etablissement)}
          >
            <Popup className="custom-popup" maxWidth={300}>
              <div className="p-2">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 mb-1">
                      {etablissement.nom}
                    </h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin size={14} />
                      <span>{etablissement.localisation}</span>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    establishmentTypes.find(t => t.value === etablissement.type)?.color || 'bg-gray-100 text-gray-800'
                  }`}>
                    {establishmentTypes.find(t => t.value === etablissement.type)?.label || 'Centre de Santé'}
                  </span>
                </div>

                {etablissement.telephone && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                    <Phone size={14} />
                    <span>{etablissement.telephone}</span>
                  </div>
                )}

                {etablissement.email && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
                    <Mail size={14} />
                    <span>{etablissement.email}</span>
                  </div>
                )}

                {etablissement.description && (
                  <div className="text-sm text-gray-700 mb-3">
                    {etablissement.description}
                  </div>
                )}

                {etablissement.services.length > 0 && (
                  <div className="mb-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Services disponibles:</h4>
                    <div className="flex flex-wrap gap-1">
                      {etablissement.services.map((service) => (
                        <span
                          key={service.id}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {service.nom}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                      />
                    ))}
                    <span className="text-sm text-gray-600 ml-1">(4.0)</span>
                  </div>
					<button className="text-sm text-blue-600 hover:text-blue-700 font-medium" onClick={() => openDetails(etablissement)}>
						Voir détails
					</button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

	  <Modal isOpen={isDetailsOpen} onClose={() => setIsDetailsOpen(false)} title={selectedEtablissement ? selectedEtablissement.nom : 'Détails établissement'} maxWidth="lg">
		{isDetailsLoading ? (
			<div className="flex items-center justify-center py-12">
				<LoadingSpinner size="lg" />
			</div>
		) : selectedEtablissement ? (
			<div className="space-y-6">
				<div className="space-y-1">
					<div className="text-sm text-gray-600 flex items-center space-x-2">
						<MapPin size={14} />
						<span>{selectedEtablissement.localisation}</span>
					</div>
					<div className="flex items-center space-x-4 text-sm text-gray-600">
						{selectedEtablissement.telephone && (
							<span className="flex items-center space-x-1"><Phone size={14} /><span>{selectedEtablissement.telephone}</span></span>
						)}
						{selectedEtablissement.email && (
							<span className="flex items-center space-x-1"><Mail size={14} /><span>{selectedEtablissement.email}</span></span>
						)}
					</div>
				</div>

				<div>
					<h4 className="text-sm font-medium text-gray-700 mb-2">Services disponibles</h4>
					<div className="flex flex-wrap gap-2">
						{(selectedEtablissement.services || []).length > 0 ? (
							selectedEtablissement.services.map(svc => (
								<span key={svc.id} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">{svc.nom}</span>
							))
						) : (
							<span className="text-sm text-gray-500">Aucun service renseigné</span>
						)}
					</div>
				</div>

				<div>
					<h4 className="text-sm font-medium text-gray-700 mb-2">Avis des utilisateurs</h4>
					{avis.length === 0 ? (
						<p className="text-sm text-gray-500">Aucun avis pour le moment</p>
					) : (
						<div className="space-y-3 max-h-64 overflow-y-auto">
							{avis.map(a => (
								<div key={a.id} className="border rounded-md p-3">
									<div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-800">{a.utilisateur?.prenom} {a.utilisateur?.nom}</span>
                    {resolveReviewServiceName(a) && (
                      <span className="ml-2 text-xs text-gray-500">({resolveReviewServiceName(a)})</span>
                    )}
										<div className="flex items-center space-x-1">
											{[...Array(5)].map((_, i) => (
												<Star key={i} size={12} className={i < a.note ? 'text-yellow-400 fill-current' : 'text-gray-300'} />
											))}
										</div>
									</div>
                  <p className="text-sm text-gray-700">{a.commentaire}</p>
									{a.dateCreation && (
										<p className="text-xs text-gray-500 mt-1">{new Date(a.dateCreation).toLocaleDateString()}</p>
									)}
								</div>
							))}
						</div>
					)}
					<div className="mt-3">
						<button onClick={handleStartReview} className="inline-flex items-center px-3 py-1.5 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700">Donner un avis</button>
					</div>
				</div>

        {isReviewFormOpen && (
					<div className="border-t pt-4">
						<h4 className="text-sm font-medium text-gray-700 mb-2">Donner votre avis</h4>
            <div className="mb-2">
              <label className="block text-xs text-gray-600 mb-1">Service concerné</label>
              <select className="w-full border rounded-md p-2 text-sm"
                value={selectedServiceForReview}
                onChange={e => setSelectedServiceForReview(e.target.value as any)}>
                <option value="">Sélectionnez un service</option>
                {(selectedEtablissement?.services || []).map(s => (
                  <option key={s.id} value={s.id}>{s.nom}</option>
                ))}
              </select>
            </div>
						
						<div className="flex items-center gap-2 mb-2">
							{[1,2,3,4,5].map(n => (
								<button key={n} type="button" onClick={() => setReviewNote(n)} className={n <= reviewNote ? 'text-yellow-500' : 'text-gray-300'}>
									★
								</button>
							))}
						</div>
						<textarea value={reviewComment} onChange={e => setReviewComment(e.target.value)} className="w-full border rounded-md p-2 text-sm" rows={3} placeholder="Votre commentaire..."></textarea>
						<div className="mt-2 flex justify-end">
							<button disabled={isSubmittingReview} onClick={submitReview} className={`px-3 py-1.5 text-sm rounded-md ${isSubmittingReview ? 'bg-gray-300 text-gray-600' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
								{isSubmittingReview ? 'Envoi...' : 'Envoyer'}
							</button>
						</div>
					</div>
				)}
			</div>
		) : null}
	  </Modal>
    </div>
  );
};

export default InteractiveMap;

const MapAutoView: React.FC<{ etablissements: Etablissement[] }> = ({ etablissements }) => {
  const map = useMap();
  useEffect(() => {
    if (etablissements.length > 0) {
      const bounds = latLngBounds(etablissements.map(e => [e.latitude, e.longitude] as [number, number]));
      map.fitBounds(bounds, { padding: [50, 50] });
      return;
    }
    const senegalBounds = latLngBounds([[12.0, -17.7], [16.7, -11.4]]);
    map.fitBounds(senegalBounds, { padding: [50, 50] });
  }, [etablissements, map]);
  return null;
};