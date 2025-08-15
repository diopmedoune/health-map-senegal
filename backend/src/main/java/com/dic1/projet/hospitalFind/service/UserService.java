package com.dic1.projet.hospitalFind.service;

import com.dic1.projet.hospitalFind.dto.TuteurDTO;
import com.dic1.projet.hospitalFind.entity.Tuteur;
import com.dic1.projet.hospitalFind.entity.Utilisateur;
import com.dic1.projet.hospitalFind.repository.TuteurRepository;
import com.dic1.projet.hospitalFind.repository.UtilisateurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    @Autowired
    private TuteurRepository tuteurRepository;

    public List<Object> getAllUsers() {
        List<Utilisateur> users = utilisateurRepository.findAll();
        return users.stream().map(user -> {
            if (user instanceof Tuteur) {
                Tuteur tuteur = (Tuteur) user;
                TuteurDTO dto = new TuteurDTO();
                dto.setId(tuteur.getIdUtilisateur());
                dto.setNom(tuteur.getNom());
                dto.setPrenom(tuteur.getPrenom());
                dto.setEmail(tuteur.getEmail());
                dto.setRole("STANDARD");
                dto.setEstActif(tuteur.getEstActif());
                return dto;
            } else {
        
                TuteurDTO dto = new TuteurDTO();
                dto.setId(user.getIdUtilisateur());
                dto.setNom(user.getNom());
                dto.setPrenom(user.getPrenom());
                dto.setEmail(user.getEmail());
                dto.setRole(user.getRole().name());
                dto.setEstActif(true);
                return dto;
            }
        }).collect(Collectors.toList());
    }

    public Object getUserById(Long id) {
        Utilisateur user = utilisateurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        if (user instanceof Tuteur) {
            Tuteur tuteur = (Tuteur) user;
            TuteurDTO dto = new TuteurDTO();
            dto.setId(tuteur.getIdUtilisateur());
            dto.setNom(tuteur.getNom());
            dto.setPrenom(tuteur.getPrenom());
            dto.setEmail(tuteur.getEmail());
            dto.setRole("STANDARD");
            dto.setEstActif(tuteur.getEstActif());
            return dto;
        } else {
            TuteurDTO dto = new TuteurDTO();
            dto.setId(user.getIdUtilisateur());
            dto.setNom(user.getNom());
            dto.setPrenom(user.getPrenom());
            dto.setEmail(user.getEmail());
            dto.setRole(user.getRole().name());
            dto.setEstActif(true);
            return dto;
        }
    }
}