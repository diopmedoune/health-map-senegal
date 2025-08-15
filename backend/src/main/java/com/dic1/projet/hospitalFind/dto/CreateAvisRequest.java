package com.dic1.projet.hospitalFind.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateAvisRequest {
    @NotNull
    private Long etablissementId;
    
    @NotNull
    private Long serviceId;
    
    @Min(1)
    @Max(5)
    @NotNull
    private Integer note;
    
    private String commentaire;
}