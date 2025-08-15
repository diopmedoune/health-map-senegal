package com.dic1.projet.hospitalFind.repository;

import com.dic1.projet.hospitalFind.entity.Tuteur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TuteurRepository extends JpaRepository<Tuteur, Long> {
    Optional<Tuteur> findByEmail(String email);
    
    @Query("SELECT t FROM Tuteur t LEFT JOIN FETCH t.etablissement")
    List<Tuteur> findAllWithEtablissement();
}