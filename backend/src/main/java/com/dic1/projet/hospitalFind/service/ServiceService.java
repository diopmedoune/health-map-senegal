package com.dic1.projet.hospitalFind.service;

import com.dic1.projet.hospitalFind.dto.CreateServiceRequest;
import com.dic1.projet.hospitalFind.dto.ServiceDTO;
import com.dic1.projet.hospitalFind.entity.Service;
import com.dic1.projet.hospitalFind.repository.ServiceRepository;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.stream.Collectors;

@org.springframework.stereotype.Service
public class ServiceService {

    @Autowired
    private ServiceRepository serviceRepository;

    public List<ServiceDTO> getAllServices() {
        return serviceRepository.findAll().stream()
                .map(s -> new ServiceDTO(s.getIdService(), s.getNom(), s.getDescription()))
                .collect(Collectors.toList());
    }

    public ServiceDTO getServiceById(Long id) {
        Service service = serviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service non trouvé"));
        return new ServiceDTO(service.getIdService(), service.getNom(), service.getDescription());
    }

    public Service createService(CreateServiceRequest request) {
        Service service = new Service();
        service.setNom(request.getNom());
        service.setDescription(request.getDescription());
        return serviceRepository.save(service);
    }

    public void deleteService(Long id) {
        serviceRepository.deleteById(id);
    }
}