package com.dic1.projet.hospitalFind.controller;

import com.dic1.projet.hospitalFind.dto.EtablissementAdminDTO;
import com.dic1.projet.hospitalFind.dto.ErrorResponse;
import com.dic1.projet.hospitalFind.dto.SuccessResponse;
import com.dic1.projet.hospitalFind.service.AvisService;
import com.dic1.projet.hospitalFind.service.EtablissementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private EtablissementService etablissementService;

    @Autowired
    private AvisService avisService;



    @DeleteMapping("/avis/{id}")
    public ResponseEntity<?> deleteAvis(@PathVariable Long id) {
        try {
            avisService.deleteAvis(id);
            SuccessResponse response = new SuccessResponse("Avis supprimé avec succès", "SUCCESS");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ErrorResponse errorResponse = new ErrorResponse(e.getMessage(), "BAD_REQUEST", 400);
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}