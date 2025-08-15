package com.dic1.projet.hospitalFind.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EtablissementAdminDTO {
    private Long id;
    private String nom;
    private String localisation;
    private String statut;
    private Double latitude;
    private Double longitude;
    private TuteurDTO tuteur;
    private List<AdministrateurDTO> administrateurs;
    private List<ServiceDTO> services;
}