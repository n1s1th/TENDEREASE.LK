package lk.tenderease.tender.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Entity
@Table(name = "tender_amendment")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TenderAmendment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer amendmentNumber;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "current_version_number")
    private Integer currentVersionNumber;

    private LocalDateTime previousClosingDate;
    private LocalDateTime newClosingDate;

    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "tender_id")
    private Tender tender;

    @OneToMany(mappedBy = "addendum", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<AddendumVersion> versions = new ArrayList<>();

    /**
     * Returns the latest version (highest version number), if any.
     */
    public Optional<AddendumVersion> getLatestVersion() {
        return versions.stream()
                .max(Comparator.comparingInt(AddendumVersion::getVersionNumber));
    }
}