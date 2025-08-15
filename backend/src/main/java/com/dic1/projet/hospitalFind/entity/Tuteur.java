package com.dic1.projet.hospitalFind.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "TUTEUR")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Tuteur extends Utilisateur {

    @Column(name = "est_actif")
    private Boolean estActif = true;

    @OneToOne(mappedBy = "tuteur", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonBackReference
    private Etablissement etablissement;
}