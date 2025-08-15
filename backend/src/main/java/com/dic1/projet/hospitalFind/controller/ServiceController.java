package com.dic1.projet.hospitalFind.controller;

import com.dic1.projet.hospitalFind.dto.CreateServiceRequest;
import com.dic1.projet.hospitalFind.dto.ErrorResponse;
import com.dic1.projet.hospitalFind.dto.ServiceDTO;
import com.dic1.projet.hospitalFind.dto.SuccessResponse;
import com.dic1.projet.hospitalFind.entity.Service;
import com.dic1.projet.hospitalFind.service.ServiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/services")
@CrossOrigin(origins = "*")
public class ServiceController {

    @Autowired
    private ServiceService serviceService;

    @GetMapping
    public ResponseEntity<List<ServiceDTO>> getAllServices() {
        List<ServiceDTO> services = serviceService.getAllServices();
        return ResponseEntity.ok(services);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServiceDTO> getServiceById(@PathVariable Long id) {
        try {
            ServiceDTO service = serviceService.getServiceById(id);
            return ResponseEntity.ok(service);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/create")
    public ResponseEntity<?> createService(@RequestBody CreateServiceRequest request) {
        try {
            Service service = serviceService.createService(request);
            return ResponseEntity.ok(service);
        } catch (Exception e) {
            ErrorResponse errorResponse = new ErrorResponse(e.getMessage(), "BAD_REQUEST", 400);
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @DeleteMapping("/{id}/delete")
    public ResponseEntity<?> deleteService(@PathVariable Long id) {
        try {
            serviceService.deleteService(id);
            SuccessResponse response = new SuccessResponse("Service supprimé avec succès", "SUCCESS");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ErrorResponse errorResponse = new ErrorResponse(e.getMessage(), "BAD_REQUEST", 400);
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}