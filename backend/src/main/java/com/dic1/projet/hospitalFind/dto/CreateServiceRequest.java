package com.dic1.projet.hospitalFind.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateServiceRequest {
    @NotBlank
    private String nom;
    
    private String description;
}