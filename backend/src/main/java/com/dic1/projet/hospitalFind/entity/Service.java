package com.dic1.projet.hospitalFind.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "service")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Service {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_service")
    private Long idService;

    @NotBlank(message = "Le nom du service ne peut pas être vide")
    @Size(min = 2, max = 100, message = "Le nom doit contenir entre 2 et 100 caractères")
    @Column(name = "nom", nullable = false, length = 100)
    private String nom;

    @Size(max = 500, message = "La description ne peut pas dépasser 500 caractères")
    @Column(name = "description", length = 500)
    private String description;

    @ManyToMany
    @JoinTable(
            name = "etablissement_service",
            joinColumns = @JoinColumn(name = "id_service"),
            inverseJoinColumns = @JoinColumn(name = "id_etablissement")
    )
    @JsonIgnore
    private Set<Etablissement> etablissements = new HashSet<>();

    public Service(String nom, String description) {
        this.nom = nom;
        this.description = description;
        this.etablissements = new HashSet<>();
    }

    public void addEtablissement(Etablissement etablissement) {
        etablissements.add(etablissement);
        etablissement.getServices().add(this);
    }

    public void removeEtablissement(Etablissement etablissement) {
        etablissements.remove(etablissement);
        etablissement.getServices().remove(this);
    }

    @PreRemove
    private void removeServiceFromEtablissements() {
        for (Etablissement etablissement : etablissements) {
            etablissement.getServices().remove(this);
        }
    }
}