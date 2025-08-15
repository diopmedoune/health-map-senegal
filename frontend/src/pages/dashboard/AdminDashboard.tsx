import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import { EtablissementAdmin, Service, User } from '../../types';
import { Users, Building2, Clock, CheckCircle, XCircle, Plus, Trash, Eye } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Modal from '../../components/ui/Modal';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

const AdminDashboard: React.FC = () => {
  const [etablissements, setEtablissements] = useState<EtablissementAdmin[]>([]);
  const [etablissementsEnAttente, setEtablissementsEnAttente] = useState<EtablissementAdmin[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateServiceModal, setShowCreateServiceModal] = useState(false);
  const [showAvisModal, setShowAvisModal] = useState(false);
  const [avisLoading, setAvisLoading] = useState(false);
  const [selectedEtabForAvis, setSelectedEtabForAvis] = useState<EtablissementAdmin | null>(null);
  const [etabAvis, setEtabAvis] = useState<any[]>([]);
  const [showPending, setShowPending] = useState(true);
  const [showAll, setShowAll] = useState(true);
  const [showServices, setShowServices] = useState(true);

  const statsRef = useRef<HTMLDivElement | null>(null);
  const pendingRef = useRef<HTMLDivElement | null>(null);
  const allRef = useRef<HTMLDivElement | null>(null);
  const servicesRef = useRef<HTMLDivElement | null>(null);
  const NAVBAR_OFFSET = 80;

  const getAvisId = (a: any): number | null => {
    const raw = a?.id ?? a?.avisId ?? a?.reviewId ?? a?._id ?? a?.idAvis;
    if (raw == null) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  };

  const { register, handleSubmit, reset, formState: { errors } } = useForm<{ nom: string; description: string }>();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [etablissementsData, etablissementsEnAttenteData, servicesData] = await Promise.all([
        api.getAllEtablissements(),
        api.getEtablissementsEnAttente(),
        api.getServices()
      ]);

      setEtablissements(etablissementsData);
      setEtablissementsEnAttente(etablissementsEnAttenteData);
      setServices(servicesData);

      try {
        const usersData = await api.getAllUsers();
        setUsers(usersData);
      } catch (error) {
        console.warn('Could not load users data');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidateEtablissement = async (id: number) => {
    try {
      await api.validateEtablissement(id);
      toast.success('Établissement validé avec succès');
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la validation');
    }
  };

  const handleRejectEtablissement = async (id: number) => {
    try {
      await api.rejectEtablissement(id, 'Rejeté par l\'administrateur');
      toast.success('Établissement rejeté');
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors du rejet');
    }
  };

  const handleCreateService = async (data: { nom: string; description: string }) => {
    try {
      await api.createService(data);
      toast.success('Service créé avec succès');
      setShowCreateServiceModal(false);
      reset();
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la création du service');
    }
  };

  const handleDeleteEtablissement = async (id: number, nom: string) => {
    const ok = window.confirm(`Supprimer l'établissement "${nom}" ? Cette action est irréversible.`);
    if (!ok) return;
    try {
      await api.deleteEtablissement(id);
      toast.success('Établissement supprimé avec succès');
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Suppression de l'établissement impossible");
    }
  };

  const openAvisModal = async (etab: EtablissementAdmin) => {
    setSelectedEtabForAvis(etab);
    setShowAvisModal(true);
    setAvisLoading(true);
    try {
      const avis = await api.getAvisByEtablissement(etab.id);
      setEtabAvis(avis);
    } catch (_) {
      toast.error('Impossible de charger les avis');
    } finally {
      setAvisLoading(false);
    }
  };

  const handleDeleteAvis = async (avisId: number) => {
    const ok = window.confirm('Supprimer cet avis ?');
    if (!ok) return;
    try {
      await api.deleteAvis(avisId, selectedEtabForAvis?.id || undefined);
      setEtabAvis(prev => prev.filter(a => getAvisId(a) !== avisId));
      toast.success('Avis supprimé');
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Suppression de l'avis impossible (id=${avisId})`);
    }
  };

  const isServiceUsed = (serviceId: number): boolean => {
    const inValidated = etablissements.some(e => e.services?.some(s => s.id === serviceId));
    const inPending = etablissementsEnAttente.some(e => e.services?.some(s => s.id === serviceId));
    return inValidated || inPending;
  };

  const handleDeleteService = async (service: Service) => {
    if (isServiceUsed(service.id)) {
      toast.error('Ce service est utilisé par au moins un établissement');
      return;
    }
    const ok = window.confirm(`Supprimer le service "${service.nom}" ? Cette action est irréversible.`);
    if (!ok) return;
    try {
      await api.deleteService(service.id);
      toast.success('Service supprimé');
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Suppression impossible');
    }
  };

  const stats = [
    {
      title: 'Établissements validés',
      value: etablissements.filter(e => e.statut === 'VALIDE').length,
      icon: Building2,
      color: 'bg-green-100 text-green-800'
    },
    {
      title: 'En attente de validation',
      value: etablissementsEnAttente.length,
      icon: Clock,
      color: 'bg-yellow-100 text-yellow-800'
    },
    {
      title: 'Services disponibles',
      value: services.length,
      icon: CheckCircle,
      color: 'bg-blue-100 text-blue-800'
    },
    {
      title: 'Utilisateurs actifs',
      value: users.filter(u => u.estActif).length,
      icon: Users,
      color: 'bg-purple-100 text-purple-800'
    }
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
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord administrateur</h1>
          <p className="text-gray-600">Gérez les établissements et services de santé</p>
        </div>
        <button
          onClick={() => setShowCreateServiceModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          <span>Nouveau service</span>
        </button>
      </div>

      {/* Section Cards */}
      <div ref={statsRef} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-xl border bg-white shadow-sm p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-700"><Clock size={24} /></div>
            <div>
              <p className="text-sm text-gray-600">En attente</p>
              <p className="text-2xl font-bold text-gray-900">{etablissementsEnAttente.length}</p>
            </div>
          </div>
          <p className="text-sm text-gray-600">Établissements à valider par l'administration.</p>
          <div className="mt-auto">
            <button onClick={() => window.scrollTo({ top: (pendingRef.current?.getBoundingClientRect().top || 0) + window.scrollY - NAVBAR_OFFSET, behavior: 'smooth' })} className="inline-flex items-center px-4 py-2 text-sm rounded-md bg-yellow-600 text-white hover:bg-yellow-700">Accéder</button>
          </div>
        </div>
        <div className="rounded-xl border bg-white shadow-sm p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-indigo-100 text-indigo-700"><Building2 size={24} /></div>
            <div>
              <p className="text-sm text-gray-600">Tous les établissements</p>
              <p className="text-2xl font-bold text-gray-900">{etablissements.length}</p>
            </div>
          </div>
          <p className="text-sm text-gray-600">Liste complète des établissements enregistrés.</p>
          <div className="mt-auto">
            <button onClick={() => window.scrollTo({ top: (allRef.current?.getBoundingClientRect().top || 0) + window.scrollY - NAVBAR_OFFSET, behavior: 'smooth' })} className="inline-flex items-center px-4 py-2 text-sm rounded-md bg-indigo-600 text-white hover:bg-indigo-700">Accéder</button>
          </div>
        </div>
        <div className="rounded-xl border bg-white shadow-sm p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-blue-100 text-blue-700"><CheckCircle size={24} /></div>
            <div>
              <p className="text-sm text-gray-600">Services</p>
              <p className="text-2xl font-bold text-gray-900">{services.length}</p>
            </div>
          </div>
          <p className="text-sm text-gray-600">Gestion des services de santé disponibles.</p>
          <div className="mt-auto">
            <button onClick={() => window.scrollTo({ top: (servicesRef.current?.getBoundingClientRect().top || 0) + window.scrollY - NAVBAR_OFFSET, behavior: 'smooth' })} className="inline-flex items-center px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700">Accéder</button>
          </div>
        </div>
      </div>

      {/* Établissements en attente */}
      {etablissementsEnAttente.length > 0 && (
        <div ref={pendingRef} className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Établissements en attente de validation</h2>
            <button onClick={() => setShowPending(v => !v)} className="text-sm text-blue-600 hover:text-blue-700">{showPending ? 'Réduire' : 'Développer'}</button>
          </div>
          {showPending && (
          <div className="divide-y divide-gray-200">
            {etablissementsEnAttente.map((etablissement) => (
              <div key={etablissement.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{etablissement.nom}</h3>
                    <p className="text-gray-600">{etablissement.localisation}</p>
                    <p className="text-sm text-gray-500">
                      Tuteur: {etablissement.tuteur.prenom} {etablissement.tuteur.nom} ({etablissement.tuteur.email})
                    </p>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleValidateEtablissement(etablissement.id)}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle size={16} />
                      <span>Valider</span>
                    </button>
                    <button
                      onClick={() => handleRejectEtablissement(etablissement.id)}
                      className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <XCircle size={16} />
                      <span>Rejeter</span>
                    </button>
                  </div>
                </div>
                {etablissement.services.length > 0 && (
                  <div className="mt-3">
                    <div className="flex flex-wrap gap-2">
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
              </div>
            ))}
          </div>
          )}
        </div>
      )}

      {/* Tous les établissements */}
      <div ref={allRef} className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Tous les établissements</h2>
          <button onClick={() => setShowAll(v => !v)} className="text-sm text-blue-600 hover:text-blue-700">{showAll ? 'Réduire' : 'Développer'}</button>
        </div>
        {showAll && (
        <div className="divide-y divide-gray-200">
          {etablissements.length === 0 ? (
            <div className="p-6 text-sm text-gray-500">Aucun établissement</div>
          ) : (
            etablissements.map((etablissement) => (
              <div key={etablissement.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{etablissement.nom}</h3>
                    <p className="text-gray-600">{etablissement.localisation}</p>
                    {etablissement.services?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {etablissement.services.slice(0, 6).map((service) => (
                          <span key={service.id} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">{service.nom}</span>
                        ))}
                        {etablissement.services.length > 6 && (
                          <span className="text-xs text-gray-500">+{etablissement.services.length - 6} autres</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openAvisModal(etablissement)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-sm bg-indigo-600 text-white hover:bg-indigo-700"
                      title="Voir les avis"
                    >
                      <Eye size={16} />
                      <span>Avis</span>
                    </button>
                    <button
                      onClick={() => handleDeleteEtablissement(etablissement.id, etablissement.nom)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-sm bg-red-600 text-white hover:bg-red-700"
                    >
                      <Trash size={16} />
                      <span>Supprimer</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        )}
      </div>

      {/* Services */}
      <div ref={servicesRef} className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Services de santé</h2>
          <button onClick={() => setShowServices(v => !v)} className="text-sm text-blue-600 hover:text-blue-700">{showServices ? 'Réduire' : 'Développer'}</button>
        </div>
        {showServices && (
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service) => {
              const used = isServiceUsed(service.id);
              return (
                <div key={service.id} className="p-4 border border-gray-200 rounded-lg flex flex-col gap-3">
                  <div>
                    <h3 className="font-medium text-gray-900">{service.nom}</h3>
                    <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleDeleteService(service)}
                      disabled={used}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${used ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700'}`}
                      title={used ? 'Ce service est utilisé par un établissement' : 'Supprimer le service'}
                    >
                      <Trash size={16} />
                      <span>Supprimer</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        )}
      </div>

      {/* Modal pour créer un service */}
      <Modal
        isOpen={showCreateServiceModal}
        onClose={() => setShowCreateServiceModal(false)}
        title="Créer un nouveau service"
      >
        <form onSubmit={handleSubmit(handleCreateService)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom du service
            </label>
            <input
              {...register('nom', { required: 'Le nom du service est requis' })}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="ex: Cardiologie"
            />
            {errors.nom && <p className="text-sm text-red-600 mt-1">{errors.nom.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              {...register('description', { required: 'La description est requise' })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Description du service..."
            />
            {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>}
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowCreateServiceModal(false)}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Créer le service
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Avis établissement */}
      <Modal
        isOpen={showAvisModal}
        onClose={() => setShowAvisModal(false)}
        title={selectedEtabForAvis ? `Avis - ${selectedEtabForAvis.nom}` : 'Avis'}
        maxWidth="lg"
      >
        {avisLoading ? (
          <div className="py-8 flex justify-center"><LoadingSpinner /></div>
        ) : etabAvis.length === 0 ? (
          <p className="text-sm text-gray-500">Aucun avis pour cet établissement</p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {etabAvis.map((a, idx) => {
              const aid = getAvisId(a);
              return (
              <div key={aid ?? `avis-${idx}`} className="p-3 border rounded-md">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-sm text-gray-800 font-medium">
                    {a.utilisateur?.prenom} {a.utilisateur?.nom}
                    {(() => {
                      const sid = Number(a?.serviceId ?? a?.service_id ?? a?.service?.id);
                      const sname = Number.isFinite(sid)
                        ? (selectedEtabForAvis?.services || []).find((s: any) => Number(s?.id) === sid)?.nom || a?.service?.nom
                        : a?.service?.nom;
                      return sname ? <span className="ml-2 text-xs text-gray-500">({sname})</span> : null;
                    })()}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-yellow-600">{a.note}/5</span>
                    <button onClick={() => aid != null ? handleDeleteAvis(aid) : toast.error('ID avis introuvable')} className="text-red-600 hover:text-red-700 text-sm">Supprimer</button>
                  </div>
                </div>
                <p className="text-sm text-gray-700">{a.commentaire}</p>
                {a.dateCreation && (
                  <p className="text-xs text-gray-500 mt-1">{new Date(a.dateCreation).toLocaleString()}</p>
                )}
              </div>
            );})}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminDashboard;