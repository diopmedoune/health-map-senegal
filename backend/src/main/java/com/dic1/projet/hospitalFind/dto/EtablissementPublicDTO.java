package com.dic1.projet.hospitalFind.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EtablissementPublicDTO {
    private Long id;
    private String nom;
    private String localisation;
    private String statut;
    private String tuteurNom;
    private String tuteurPrenom;
    private Double latitude;
    private Double longitude;
    private List<ServiceDTO> services;
}