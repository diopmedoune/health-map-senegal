package com.dic1.projet.hospitalFind.controller;

import com.dic1.projet.hospitalFind.dto.EtablissementAdminDTO;
import com.dic1.projet.hospitalFind.dto.EtablissementPublicDTO;
import com.dic1.projet.hospitalFind.dto.ErrorResponse;
import com.dic1.projet.hospitalFind.dto.SuccessResponse;
import com.dic1.projet.hospitalFind.service.EtablissementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/etablissements")
@CrossOrigin(origins = "*")
public class EtablissementController {

    @Autowired
    private EtablissementService etablissementService;

    @GetMapping
    public ResponseEntity<List<EtablissementPublicDTO>> getAllEtablissements() {
        List<EtablissementPublicDTO> etablissements = etablissementService.getAllEtablissementsPublic();
        return ResponseEntity.ok(etablissements);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EtablissementPublicDTO> getEtablissementById(@PathVariable Long id) {
        try {
            EtablissementPublicDTO etablissement = etablissementService.getEtablissementPublicById(id);
            return ResponseEntity.ok(etablissement);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/admin")
    public ResponseEntity<List<EtablissementAdminDTO>> getAllEtablissementsAdmin() {
        List<EtablissementAdminDTO> etablissements = etablissementService.getAllEtablissementsAdmin();
        return ResponseEntity.ok(etablissements);
    }

    @GetMapping("/admin/{id}")
    public ResponseEntity<EtablissementAdminDTO> getEtablissementAdminById(@PathVariable Long id) {
        try {
            EtablissementAdminDTO etablissement = etablissementService.getEtablissementAdminById(id);
            return ResponseEntity.ok(etablissement);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/admin/en-attente")
    public ResponseEntity<List<EtablissementAdminDTO>> getEtablissementsEnAttente() {
        List<EtablissementAdminDTO> etablissements = etablissementService.getEtablissementsEnAttente();
        return ResponseEntity.ok(etablissements);
    }

    @PutMapping("/admin/{id}/valider")
    public ResponseEntity<?> validerEtablissement(@PathVariable Long id) {
        try {
            etablissementService.validerEtablissement(id);
            SuccessResponse response = new SuccessResponse("Établissement validé avec succès", "SUCCESS");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ErrorResponse errorResponse = new ErrorResponse(e.getMessage(), "BAD_REQUEST", 400);
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PutMapping("/admin/{id}/rejeter")
    public ResponseEntity<?> rejeterEtablissement(@PathVariable Long id) {
        try {
            etablissementService.rejeterEtablissement(id);
            SuccessResponse response = new SuccessResponse("Établissement rejeté avec succès", "SUCCESS");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ErrorResponse errorResponse = new ErrorResponse(e.getMessage(), "BAD_REQUEST", 400);
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @DeleteMapping("/admin/{id}")
    public ResponseEntity<?> deleteEtablissement(@PathVariable Long id) {
        try {
            etablissementService.deleteEtablissement(id);
            SuccessResponse response = new SuccessResponse("Établissement supprimé avec succès", "SUCCESS");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ErrorResponse errorResponse = new ErrorResponse(e.getMessage(), "BAD_REQUEST", 400);
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}