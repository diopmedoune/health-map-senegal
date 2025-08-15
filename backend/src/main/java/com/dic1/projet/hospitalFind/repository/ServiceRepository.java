package com.dic1.projet.hospitalFind.repository;

import com.dic1.projet.hospitalFind.entity.Service;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ServiceRepository extends JpaRepository<Service, Long> {
}