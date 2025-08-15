package com.dic1.projet.hospitalFind.service;

import com.dic1.projet.hospitalFind.dto.CreateAvisRequest;
import com.dic1.projet.hospitalFind.entity.Avis;
import com.dic1.projet.hospitalFind.entity.Etablissement;
import com.dic1.projet.hospitalFind.entity.Service;
import com.dic1.projet.hospitalFind.entity.Utilisateur;
import com.dic1.projet.hospitalFind.repository.AvisRepository;
import com.dic1.projet.hospitalFind.repository.EtablissementRepository;
import com.dic1.projet.hospitalFind.repository.ServiceRepository;
import com.dic1.projet.hospitalFind.repository.UtilisateurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@org.springframework.stereotype.Service
@Transactional(readOnly = true)
public class AvisService {

    

    @Autowired
    private AvisRepository avisRepository;

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    @Autowired
    private EtablissementRepository etablissementRepository;

    @Autowired
    private ServiceRepository serviceRepository;

    @Transactional
    public Avis createAvis(CreateAvisRequest request, Long userId) {

        Utilisateur utilisateur = utilisateurRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        Etablissement etablissement = etablissementRepository.findById(request.getEtablissementId())
                .orElseThrow(() -> new RuntimeException("Établissement non trouvé"));

        Service service = serviceRepository.findById(request.getServiceId())
                .orElseThrow(() -> new RuntimeException("Service non trouvé"));

        Avis avis = new Avis();
        avis.setUtilisateur(utilisateur);
        avis.setEtablissement(etablissement);
        avis.setService(service);
        avis.setNote(request.getNote());
        avis.setCommentaire(request.getCommentaire());

        Avis savedAvis = avisRepository.save(avis);
        return savedAvis;
    }

    public List<Avis> getAvisByEtablissement(Long etablissementId) {
        return avisRepository.findByEtablissementIdWithUser(etablissementId);
    }
    public List<Avis> getAvisByEtablissementOld(Long etablissementId) {
        return avisRepository.findByEtablissement_IdEtablissement(etablissementId);
    }

    @Transactional
    public void deleteAvis(Long id) {
        if (!avisRepository.existsById(id)) {
            throw new RuntimeException("Avis non trouvé avec l'ID: " + id);
        }

        avisRepository.deleteById(id);
    }

    @Transactional
    public void deleteAvisByEtablissement(Long etablissementId) {
        List<Avis> avis = avisRepository.findByEtablissement_IdEtablissement(etablissementId);
        if (!avis.isEmpty()) {
            avisRepository.deleteAll(avis);
        }
    }

    public Avis getAvisById(Long avisId) {
        return avisRepository.findById(avisId)
                .orElseThrow(() -> new RuntimeException("Avis non trouvé avec l'ID: " + avisId));
    }

    public List<Avis> getAvisByUtilisateur(Long utilisateurId) {
        return avisRepository.findByUtilisateur_IdUtilisateur(utilisateurId);
    }
}