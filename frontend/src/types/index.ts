export interface Service {
  id: number;
  nom: string;
  description: string;
}

export interface Etablissement {
  id: number;
  nom: string;
  localisation: string;
  statut: 'VALIDE' | 'EN_ATTENTE' | 'REFUSE';
  tuteurNom?: string;
  tuteurPrenom?: string;
  latitude: number;
  longitude: number;
  services: Service[];
  type?: 'HOPITAL' | 'CLINIQUE' | 'CENTRE_SANTE' | 'POSTE_SANTE' | 'PHARMACIE';
  telephone?: string;
  email?: string;
  description?: string;
  adresse?: string;
}

export interface EtablissementAdmin extends Etablissement {
  tuteur: {
    id: number;
    nom: string;
    prenom: string;
    email: string;
    role: string;
    estActif: boolean;
  };
  administrateurs: any;
}

export interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: 'ADMIN' | 'TUTEUR' | 'STANDARD';
  estActif: boolean;
}

export interface CreateEtablissementData {
  nom: string;
  adresse: string;
  telephone: string;
  email: string;
  description: string;
  type: 'HOPITAL' | 'CLINIQUE' | 'CENTRE_SANTE' | 'POSTE_SANTE' | 'PHARMACIE';
  latitude: number;
  longitude: number;
  serviceIds: number[];
}

export interface Avis {
  id: number;
  note: number;
  commentaire: string;
  utilisateur: User;
  etablissement: Etablissement;
  dateCreation: string;
  modere?: boolean;
  service?: Service;
  serviceId?: number;
}