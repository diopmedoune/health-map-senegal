package com.dic1.projet.hospitalFind.repository;

import com.dic1.projet.hospitalFind.entity.Avis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AvisRepository extends JpaRepository<Avis, Long> {


    @Query("SELECT a FROM Avis a WHERE a.etablissement.idEtablissement = :etablissementId")
    List<Avis> findByEtablissement_IdEtablissement(@Param("etablissementId") Long etablissementId);


    @Query("SELECT a FROM Avis a " +
            "LEFT JOIN FETCH a.utilisateur " +
            "LEFT JOIN FETCH a.etablissement " +
            "WHERE a.etablissement.idEtablissement = :etablissementId")
    List<Avis> findByEtablissementIdWithDetails(@Param("etablissementId") Long etablissementId);


    @Query("SELECT a FROM Avis a " +
            "LEFT JOIN FETCH a.utilisateur " +
            "WHERE a.etablissement.idEtablissement = :etablissementId")
    List<Avis> findByEtablissementIdWithUser(@Param("etablissementId") Long etablissementId);


    @Query("SELECT a FROM Avis a LEFT JOIN FETCH a.utilisateur WHERE a.utilisateur.idUtilisateur = :utilisateurId")
    List<Avis> findByUtilisateur_IdUtilisateur(@Param("utilisateurId") Long utilisateurId);
}