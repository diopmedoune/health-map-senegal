package com.dic1.projet.hospitalFind.service;

import com.dic1.projet.hospitalFind.dto.*;
import com.dic1.projet.hospitalFind.entity.Etablissement;
import com.dic1.projet.hospitalFind.entity.Service;
import com.dic1.projet.hospitalFind.entity.Tuteur;
import com.dic1.projet.hospitalFind.repository.EtablissementRepository;
import com.dic1.projet.hospitalFind.repository.ServiceRepository;
import com.dic1.projet.hospitalFind.repository.TuteurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@org.springframework.stereotype.Service
public class EtablissementService {

    @Autowired
    private EtablissementRepository etablissementRepository;

    @Autowired
    private ServiceRepository serviceRepository;

    @Autowired
    private TuteurRepository tuteurRepository;

    @Autowired
    private AvisService avisService;

    public List<EtablissementPublicDTO> getAllEtablissementsPublic() {
        List<Etablissement> etablissements = etablissementRepository.findAllWithTuteurAndServices();
        return etablissements.stream()
                .filter(e -> e.getStatut() == Etablissement.Statut.VALIDE)
                .map(this::convertToPublicDTO)
                .collect(Collectors.toList());
    }

    public EtablissementPublicDTO getEtablissementPublicById(Long id) {
        Etablissement etablissement = etablissementRepository.findByIdWithTuteurAndServices(id)
                .orElseThrow(() -> new RuntimeException("Établissement non trouvé"));
        
        if (etablissement.getStatut() != Etablissement.Statut.VALIDE) {
            throw new RuntimeException("Établissement non accessible");
        }
        
        return convertToPublicDTO(etablissement);
    }

    public List<EtablissementAdminDTO> getAllEtablissementsAdmin() {
        List<Etablissement> etablissements = etablissementRepository.findAllWithTuteurAndServices();
        return etablissements.stream()
                .map(this::convertToAdminDTO)
                .collect(Collectors.toList());
    }

    public EtablissementAdminDTO getEtablissementAdminById(Long id) {
        Etablissement etablissement = etablissementRepository.findByIdWithTuteurAndServices(id)
                .orElseThrow(() -> new RuntimeException("Établissement non trouvé"));
        return convertToAdminDTO(etablissement);
    }

    public List<EtablissementAdminDTO> getEtablissementsEnAttente() {
        List<Etablissement> etablissements = etablissementRepository.findByStatutWithTuteurAndServices(Etablissement.Statut.EN_ATTENTE);
        return etablissements.stream()
                .map(this::convertToAdminDTO)
                .collect(Collectors.toList());
    }

    public void validerEtablissement(Long id) {
        Etablissement etablissement = etablissementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Établissement non trouvé"));
        etablissement.setStatut(Etablissement.Statut.VALIDE);
        etablissementRepository.save(etablissement);
    }

    public void rejeterEtablissement(Long id) {
        Etablissement etablissement = etablissementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Établissement non trouvé"));
        etablissement.setStatut(Etablissement.Statut.REJETE);
        etablissementRepository.save(etablissement);
    }

    public void deleteEtablissement(Long id) {
        etablissementRepository.deleteById(id);
    }

    @Transactional
    public Etablissement createEtablissement(CreateEtablissementRequest request, Long tuteurId) {
        Tuteur tuteur = tuteurRepository.findById(tuteurId)
                .orElseThrow(() -> new RuntimeException("Tuteur non trouvé"));

        Etablissement existingEtablissement = etablissementRepository.findByTuteurIdUtilisateur(tuteurId).orElse(null);
        
        if (existingEtablissement != null) {
            if (existingEtablissement.getStatut() == Etablissement.Statut.REJETE) {
                existingEtablissement.setNom(request.getNom());
                existingEtablissement.setAdresse(request.getAdresse());
                existingEtablissement.setLocalisation(request.getLocalisation());
                existingEtablissement.setTelephone(request.getTelephone());
                existingEtablissement.setEmail(request.getEmail());
                existingEtablissement.setDescription(request.getDescription());
                existingEtablissement.setTypeEtablissement(Etablissement.TypeEtablissement.valueOf(request.getType()));
                existingEtablissement.setLatitude(request.getLatitude());
                existingEtablissement.setLongitude(request.getLongitude());
                existingEtablissement.setStatut(Etablissement.Statut.EN_ATTENTE);
                existingEtablissement.getServices().clear();
                for (Long serviceId : request.getServiceIds()) {
                    Service service = serviceRepository.findById(serviceId)
                            .orElseThrow(() -> new RuntimeException("Service non trouvé: " + serviceId));
                    existingEtablissement.getServices().add(service);
                }
                
                return etablissementRepository.save(existingEtablissement);
            } else {
                throw new RuntimeException("Ce tuteur a déjà un établissement " + existingEtablissement.getStatut() + ". Utilisez la mise à jour pour modifier l'établissement existant.");
            }
        }

        Etablissement etablissement = new Etablissement();
        etablissement.setNom(request.getNom());
        String adresse = request.getLocalisation() != null ? request.getLocalisation() : request.getAdresse();
        if (adresse == null || adresse.trim().isEmpty()) {
            throw new RuntimeException("L'adresse ou la localisation est obligatoire");
        }
        etablissement.setAdresse(adresse);
        etablissement.setLocalisation(adresse);
        
        etablissement.setTelephone(request.getTelephone());
        etablissement.setEmail(request.getEmail());
        etablissement.setDescription(request.getDescription());
        etablissement.setLatitude(request.getLatitude());
        etablissement.setLongitude(request.getLongitude());
        etablissement.setTuteur(tuteur);
        etablissement.setStatut(Etablissement.Statut.EN_ATTENTE);

        try {
            etablissement.setTypeEtablissement(Etablissement.TypeEtablissement.valueOf(request.getType()));
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Type d'établissement invalide");
        }
        if (request.getServiceIds() != null) {
            for (Long serviceId : request.getServiceIds()) {
                Service service = serviceRepository.findById(serviceId)
                        .orElseThrow(() -> new RuntimeException("Service non trouvé: " + serviceId));
                etablissement.addService(service);
            }
        }

        return etablissementRepository.save(etablissement);
    }

    public Etablissement updateEtablissement(Long etablissementId, CreateEtablissementRequest request, Long tuteurId) {
        Etablissement etablissement = etablissementRepository.findById(etablissementId)
                .orElseThrow(() -> new RuntimeException("Établissement non trouvé"));

        if (!etablissement.getTuteur().getIdUtilisateur().equals(tuteurId)) {
            throw new RuntimeException("Non autorisé à modifier cet établissement");
        }

        etablissement.setNom(request.getNom());
        String adresse = request.getLocalisation() != null ? request.getLocalisation() : request.getAdresse();
        if (adresse == null || adresse.trim().isEmpty()) {
            throw new RuntimeException("L'adresse ou la localisation est obligatoire");
        }
        etablissement.setAdresse(adresse);
        etablissement.setLocalisation(adresse);
        
        etablissement.setTelephone(request.getTelephone());
        etablissement.setEmail(request.getEmail());
        etablissement.setDescription(request.getDescription());
        etablissement.setLatitude(request.getLatitude());
        etablissement.setLongitude(request.getLongitude());

        try {
            etablissement.setTypeEtablissement(Etablissement.TypeEtablissement.valueOf(request.getType()));
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Type d'établissement invalide");
        }
        etablissement.getServices().clear();
        if (request.getServiceIds() != null) {
            for (Long serviceId : request.getServiceIds()) {
                Service service = serviceRepository.findById(serviceId)
                        .orElseThrow(() -> new RuntimeException("Service non trouvé: " + serviceId));
                etablissement.addService(service);
            }
        }

        return etablissementRepository.save(etablissement);
    }

    public EtablissementPublicDTO getMyEtablissement(Long tuteurId) {
        Etablissement etablissement = etablissementRepository.findByTuteurIdUtilisateurWithTuteurAndServices(tuteurId)
                .orElseThrow(() -> new RuntimeException("Aucun établissement trouvé pour ce tuteur"));
        return convertToPublicDTO(etablissement);
    }

    private EtablissementPublicDTO convertToPublicDTO(Etablissement etablissement) {
        EtablissementPublicDTO dto = new EtablissementPublicDTO();
        dto.setId(etablissement.getIdEtablissement());
        dto.setNom(etablissement.getNom());
        dto.setLocalisation(etablissement.getLocalisation());
        dto.setStatut(etablissement.getStatut().name());
        dto.setLatitude(etablissement.getLatitude());
        dto.setLongitude(etablissement.getLongitude());
        
        if (etablissement.getTuteur() != null) {
            dto.setTuteurNom(etablissement.getTuteur().getNom());
            dto.setTuteurPrenom(etablissement.getTuteur().getPrenom());
        }
        
        List<ServiceDTO> services = etablissement.getServices().stream()
                .map(s -> new ServiceDTO(s.getIdService(), s.getNom(), s.getDescription()))
                .collect(Collectors.toList());
        dto.setServices(services);
        
        return dto;
    }

    private EtablissementAdminDTO convertToAdminDTO(Etablissement etablissement) {
        EtablissementAdminDTO dto = new EtablissementAdminDTO();
        dto.setId(etablissement.getIdEtablissement());
        dto.setNom(etablissement.getNom());
        dto.setLocalisation(etablissement.getLocalisation());
        dto.setStatut(etablissement.getStatut().name());
        dto.setLatitude(etablissement.getLatitude());
        dto.setLongitude(etablissement.getLongitude());
        
        if (etablissement.getTuteur() != null) {
            TuteurDTO tuteurDTO = new TuteurDTO();
            tuteurDTO.setId(etablissement.getTuteur().getIdUtilisateur());
            tuteurDTO.setNom(etablissement.getTuteur().getNom());
            tuteurDTO.setPrenom(etablissement.getTuteur().getPrenom());
            tuteurDTO.setEmail(etablissement.getTuteur().getEmail());
            tuteurDTO.setRole("STANDARD");
            tuteurDTO.setEstActif(etablissement.getTuteur().getEstActif());
            dto.setTuteur(tuteurDTO);
        }
        
        List<ServiceDTO> services = etablissement.getServices().stream()
                .map(s -> new ServiceDTO(s.getIdService(), s.getNom(), s.getDescription()))
                .collect(Collectors.toList());
        dto.setServices(services);
        
        return dto;
    }
}