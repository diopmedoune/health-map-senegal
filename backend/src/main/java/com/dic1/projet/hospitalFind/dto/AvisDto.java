package com.dic1.projet.hospitalFind.dto;

import com.dic1.projet.hospitalFind.entity.Avis;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AvisDto {
    private Long idAvis;
    private String commentaire;
    private LocalDateTime dateCreation;
    private Long idEtablissement;
    private Integer note;
    private Long idService;
    private String nomUtilisateur;


    public AvisDto() {}

    public AvisDto(Avis avis) {
        this.idAvis = avis.getIdAvis();
        this.commentaire = avis.getCommentaire();
        this.dateCreation = avis.getDateCreation();
        this.idEtablissement = avis.getEtablissement().getIdEtablissement();
        this.note = avis.getNote();
        this.idService = avis.getService().getIdService();
        this.nomUtilisateur = avis.getUtilisateur() != null ?
                avis.getUtilisateur().getNom() + " " + avis.getUtilisateur().getPrenom() : null;
    }


}