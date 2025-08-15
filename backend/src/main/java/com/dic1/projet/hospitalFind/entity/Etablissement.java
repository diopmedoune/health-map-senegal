package com.dic1.projet.hospitalFind.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.ToString;
import lombok.EqualsAndHashCode;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "ETABLISSEMENT")
@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"tuteur", "administrateurs", "services", "avis"})
@EqualsAndHashCode(exclude = {"tuteur", "administrateurs", "services", "avis"})
public class Etablissement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_etablissement")
    private Long idEtablissement;

    @NotBlank
    @Column(name = "nom")
    private String nom;

    @Column(name = "adresse")
    private String adresse;

    @Column(name = "localisation")
    private String localisation;

    @Column(name = "telephone")
    private String telephone;

    @Column(name = "email")
    private String email;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_etablissement")
    private TypeEtablissement typeEtablissement;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut")
    private Statut statut = Statut.EN_ATTENTE;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_tuteur")
    @JsonIgnore
    private Tuteur tuteur;

    @ManyToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE}, fetch = FetchType.LAZY)
    @JoinTable(name = "ADMIN_ETABLISSEMENT",
            joinColumns = @JoinColumn(name = "id_etablissement"),
            inverseJoinColumns = @JoinColumn(name = "id_admin"))
    @JsonIgnore
    private Set<Administrateur> administrateurs = new HashSet<>();

    @ManyToMany(mappedBy = "etablissements", fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<Service> services = new HashSet<>();

    @OneToMany(mappedBy = "etablissement", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<Avis> avis = new HashSet<>();

    public enum Statut {
        EN_ATTENTE, VALIDE, REJETE
    }

    public enum TypeEtablissement {
        HOPITAL("Hôpital"),
        CLINIQUE("Clinique"),
        CENTRE_SANTE("Centre de santé"),
        PHARMACIE("Pharmacie"),
        LABORATOIRE("Laboratoire d'analyses"),
        CABINET_MEDICAL("Cabinet médical");

        private final String displayName;

        TypeEtablissement(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }


    public void addService(Service service) {
        if (this.services == null) {
            this.services = new HashSet<>();
        }
        this.services.add(service);
        if (service.getEtablissements() == null) {
            service.setEtablissements(new HashSet<>());
        }
        service.getEtablissements().add(this);
    }

    public void removeService(Service service) {
        if (this.services != null) {
            this.services.remove(service);
        }
        if (service.getEtablissements() != null) {
            service.getEtablissements().remove(this);
        }
    }

    public void addAdministrateur(Administrateur admin) {
        if (this.administrateurs == null) {
            this.administrateurs = new HashSet<>();
        }
        this.administrateurs.add(admin);
        if (admin.getEtablissements() == null) {
            admin.setEtablissements(new HashSet<>());
        }
        admin.getEtablissements().add(this);
    }

    public void removeAdministrateur(Administrateur admin) {
        if (this.administrateurs != null) {
            this.administrateurs.remove(admin);
        }
        if (admin.getEtablissements() != null) {
            admin.getEtablissements().remove(this);
        }
    }
}