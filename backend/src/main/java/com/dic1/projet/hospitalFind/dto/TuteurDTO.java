package com.dic1.projet.hospitalFind.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TuteurDTO {
    private Long id;
    private String nom;
    private String prenom;
    private String email;
    private String role;
    private Boolean estActif;
}