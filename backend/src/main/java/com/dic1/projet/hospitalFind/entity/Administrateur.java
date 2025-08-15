package com.dic1.projet.hospitalFind.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "ADMINISTRATEUR")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Administrateur extends Utilisateur {

    @Column(name = "est_actif")
    private Boolean estActif = true;

    @ManyToMany(mappedBy = "administrateurs", fetch = FetchType.LAZY)
    private Set<Etablissement> etablissements = new HashSet<>();
}