package com.dic1.projet.hospitalFind.repository;

import com.dic1.projet.hospitalFind.entity.Etablissement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

@Repository
public interface EtablissementRepository extends JpaRepository<Etablissement, Long> {
    List<Etablissement> findByStatut(Etablissement.Statut statut);

    @Query("SELECT e FROM Etablissement e LEFT JOIN FETCH e.tuteur LEFT JOIN FETCH e.services")
    List<Etablissement> findAllWithTuteurAndServices();

    @Query("SELECT e FROM Etablissement e LEFT JOIN FETCH e.tuteur LEFT JOIN FETCH e.services WHERE e.idEtablissement = :id")
    Optional<Etablissement> findByIdWithTuteurAndServices(@Param("id") Long id);


    @Query("SELECT e FROM Etablissement e LEFT JOIN FETCH e.tuteur LEFT JOIN FETCH e.services WHERE e.statut = :statut")
    List<Etablissement> findByStatutWithTuteurAndServices(@Param("statut") Etablissement.Statut statut);

    Optional<Etablissement> findByTuteurIdUtilisateur(Long tuteurId);

    @Query("SELECT e FROM Etablissement e LEFT JOIN FETCH e.tuteur LEFT JOIN FETCH e.services WHERE e.tuteur.idUtilisateur = :tuteurId")
    Optional<Etablissement> findByTuteurIdUtilisateurWithTuteurAndServices(@Param("tuteurId") Long tuteurId);

    @Modifying
    @Query(value = "DELETE FROM etablissement WHERE id_tuteur = :tuteurId", nativeQuery = true)
    void deleteByTuteurIdUtilisateur(@Param("tuteurId") Long tuteurId);
}