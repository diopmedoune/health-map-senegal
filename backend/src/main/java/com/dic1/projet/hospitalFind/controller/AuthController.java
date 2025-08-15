package com.dic1.projet.hospitalFind.controller;

import com.dic1.projet.hospitalFind.dto.CreateUtilisateurRequest;
import com.dic1.projet.hospitalFind.dto.ErrorResponse;
import com.dic1.projet.hospitalFind.dto.LoginRequest;
import com.dic1.projet.hospitalFind.dto.LoginResponse;
import com.dic1.projet.hospitalFind.dto.SuccessResponse;
import com.dic1.projet.hospitalFind.entity.Utilisateur;
import com.dic1.projet.hospitalFind.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody CreateUtilisateurRequest request) {
        try {
            Utilisateur utilisateur = authService.register(request);
            SuccessResponse response = new SuccessResponse("Utilisateur créé avec succès", "SUCCESS");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ErrorResponse errorResponse = new ErrorResponse(e.getMessage(), "BAD_REQUEST", 400);
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            LoginResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ErrorResponse errorResponse = new ErrorResponse(e.getMessage(), "BAD_REQUEST", 400);
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}