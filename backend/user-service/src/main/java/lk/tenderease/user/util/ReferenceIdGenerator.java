package lk.tenderease.user.util;

import lk.tenderease.user.repository.OfficerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.Year;

/**
 * Utility for generating system-unique reference IDs.
 *
 * <ul>
 *   <li><strong>Registration Reference ID:</strong> {@code OFF-YYYY-XXXXX} (e.g., OFF-2026-000123)</li>
 *   <li><strong>Error Support ID:</strong> {@code ERR-REG-YYYY-XXXXX} (e.g., ERR-REG-2026-000456)</li>
 * </ul>
 *
 * <p>Uses PostgreSQL sequences ({@code officer_ref_seq}, {@code officer_support_seq})
 * for thread-safe, gap-free numbering.</p>
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ReferenceIdGenerator {

    private static final String REF_PREFIX = "OFF";
    private static final String SUPPORT_PREFIX = "ERR-REG";
    private static final int PADDING = 6;

    private final OfficerRepository officerRepository;

    /**
     * Generate a new Registration Reference ID.
     *
     * @return formatted reference ID (e.g., OFF-2026-000001)
     */
    public String generateRegistrationReference() {
        final int year = Year.now().getValue();
        final Long sequence = officerRepository.getNextReferenceSequence();
        final String referenceId = String.format("%s-%d-%s", REF_PREFIX, year,
                String.format("%0" + PADDING + "d", sequence));
        log.debug("Generated registration reference: {}", referenceId);
        return referenceId;
    }

    /**
     * Generate a new Error Support ID.
     *
     * @return formatted support ID (e.g., ERR-REG-2026-000001)
     */
    public String generateSupportId() {
        final int year = Year.now().getValue();
        final Long sequence = officerRepository.getNextSupportSequence();
        final String supportId = String.format("%s-%d-%s", SUPPORT_PREFIX, year,
                String.format("%0" + PADDING + "d", sequence));
        log.debug("Generated support ID: {}", supportId);
        return supportId;
    }
}
