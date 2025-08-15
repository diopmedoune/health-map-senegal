package com.dic1.projet.hospitalFind.controller;

import com.dic1.projet.hospitalFind.dto.AvisDto;
import com.dic1.projet.hospitalFind.dto.CreateAvisRequest;
import com.dic1.projet.hospitalFind.dto.ErrorResponse;
import com.dic1.projet.hospitalFind.entity.Avis;
import com.dic1.projet.hospitalFind.service.AvisService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;


@RestController
@RequestMapping("/avis")
@CrossOrigin(origins = "*")
public class AvisController {

    @Autowired
    private AvisService avisService;

    @PostMapping
    public ResponseEntity<?> createAvis(@RequestBody CreateAvisRequest request, Authentication authentication) {
        try {
            Long userId = (Long) authentication.getDetails();
            Avis avis = avisService.createAvis(request, userId);
            return ResponseEntity.ok(avis);
        } catch (Exception e) {
            ErrorResponse errorResponse = new ErrorResponse(e.getMessage(), "BAD_REQUEST", 400);
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @GetMapping("/etablissement/{etablissementId}")
    public ResponseEntity<List<AvisDto>> getAvisByEtablissement(@PathVariable Long etablissementId) {
        List<Avis> avis = avisService.getAvisByEtablissement(etablissementId);

        List<AvisDto> avisDto = avis.stream()
                .map(AvisDto::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(avisDto);
    }
}