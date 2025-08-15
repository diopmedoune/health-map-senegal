package com.dic1.projet.hospitalFind.service;

import com.dic1.projet.hospitalFind.dto.CreateUtilisateurRequest;
import com.dic1.projet.hospitalFind.dto.LoginRequest;
import com.dic1.projet.hospitalFind.dto.LoginResponse;
import com.dic1.projet.hospitalFind.entity.Administrateur;
import com.dic1.projet.hospitalFind.entity.Tuteur;
import com.dic1.projet.hospitalFind.entity.Utilisateur;
import com.dic1.projet.hospitalFind.repository.AdministrateurRepository;
import com.dic1.projet.hospitalFind.repository.TuteurRepository;
import com.dic1.projet.hospitalFind.repository.UtilisateurRepository;
import com.dic1.projet.hospitalFind.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    @Autowired
    private TuteurRepository tuteurRepository;

    @Autowired
    private AdministrateurRepository administrateurRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    public Utilisateur register(CreateUtilisateurRequest request) {
        if (utilisateurRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email déjà utilisé");
        }

        Utilisateur.Role role;
        try {
            role = Utilisateur.Role.valueOf(request.getRole().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Rôle invalide");
        }

        Utilisateur utilisateur;
        switch (role) {
            case STANDARD:
                utilisateur = new Utilisateur();
                break;
            case TUTEUR:
                utilisateur = new Tuteur();
                break;
            case ADMIN:
                utilisateur = new Administrateur();
                break;
            default:
                throw new RuntimeException("Rôle non supporté: " + role);
        }

        utilisateur.setNom(request.getNom());
        utilisateur.setPrenom(request.getPrenom());
        utilisateur.setEmail(request.getEmail());
        utilisateur.setMotDePasse(passwordEncoder.encode(request.getMotDePasse()));
        utilisateur.setRole(role);

        return utilisateurRepository.save(utilisateur);
    }

    public LoginResponse login(LoginRequest request) {
        Utilisateur utilisateur = utilisateurRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        if (!passwordEncoder.matches(request.getMotDePasse(), utilisateur.getMotDePasse())) {
            throw new RuntimeException("Mot de passe incorrect");
        }

        String token = jwtUtil.generateToken(
                utilisateur.getEmail(),
                utilisateur.getRole().name(),
                utilisateur.getIdUtilisateur()
        );

        return new LoginResponse(token, utilisateur.getRole().name(), utilisateur.getIdUtilisateur());
    }
}