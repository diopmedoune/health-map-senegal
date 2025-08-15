package com.dic1.projet.hospitalFind.controller;

import com.dic1.projet.hospitalFind.dto.CreateEtablissementRequest;
import com.dic1.projet.hospitalFind.dto.EtablissementPublicDTO;
import com.dic1.projet.hospitalFind.dto.ErrorResponse;
import com.dic1.projet.hospitalFind.dto.SuccessResponse;
import com.dic1.projet.hospitalFind.entity.Etablissement;
import com.dic1.projet.hospitalFind.service.EtablissementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/tuteur")
@CrossOrigin(origins = "*")
public class TuteurController {

    @Autowired
    private EtablissementService etablissementService;

    @PostMapping("/etablissement")
    public ResponseEntity<?> createEtablissement(@RequestBody CreateEtablissementRequest request) {
        try {
                    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Long tuteurId = (Long) authentication.getDetails();

            Etablissement etablissement = etablissementService.createEtablissement(request, tuteurId);
            SuccessResponse response = new SuccessResponse("Établissement créé avec succès et en attente de validation", "SUCCESS");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ErrorResponse errorResponse = new ErrorResponse(e.getMessage(), "BAD_REQUEST", 400);
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PutMapping("/etablissement/{id}")
    public ResponseEntity<?> updateEtablissement(@PathVariable Long id, @RequestBody CreateEtablissementRequest request) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            Long tuteurId = (Long) authentication.getDetails();

            Etablissement etablissement = etablissementService.updateEtablissement(id, request, tuteurId);
            SuccessResponse response = new SuccessResponse("Établissement mis à jour avec succès", "SUCCESS");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ErrorResponse errorResponse = new ErrorResponse(e.getMessage(), "BAD_REQUEST", 400);
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @GetMapping("/etablissement")
    public ResponseEntity<?> getMyEtablissement() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            Long tuteurId = (Long) authentication.getDetails();

            EtablissementPublicDTO etablissement = etablissementService.getMyEtablissement(tuteurId);
            return ResponseEntity.ok(etablissement);
        } catch (Exception e) {
            ErrorResponse errorResponse = new ErrorResponse(e.getMessage(), "NOT_FOUND", 404);
            return ResponseEntity.notFound().build();
        }
    }
}