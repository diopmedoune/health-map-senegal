package com.dic1.projet.hospitalFind.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Email;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateEtablissementRequest {

    @NotBlank(message = "Le nom est obligatoire")
    private String nom;

    private String adresse;

    private String localisation;

    private String telephone;

    @Email(message = "Format d'email invalide")
    private String email;

    private String description;

    @NotBlank(message = "Le type d'établissement est obligatoire")
    private String type;

    private Double latitude;

    private Double longitude;

    private List<Long> serviceIds;
}