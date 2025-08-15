package com.dic1.projet.hospitalFind.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EtablissementDTO {
    private Long id;
    private String nom;
    private String localisation;
    private String statut;
    private String tuteurNom;
    private String tuteurPrenom;
    private String tuteurEmail;
}