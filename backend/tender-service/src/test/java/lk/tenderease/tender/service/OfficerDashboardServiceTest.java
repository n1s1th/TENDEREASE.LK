package lk.tenderease.tender.service;

import lk.tenderease.tender.dto.response.DashboardMetricsResponse;
import lk.tenderease.tender.dto.response.OfficerTenderResponse;
import lk.tenderease.tender.entity.Tender;
import lk.tenderease.tender.enums.ProcurementType;
import lk.tenderease.tender.enums.TenderStatus;
import lk.tenderease.tender.repository.TenderRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OfficerDashboardServiceTest {

    @Mock
    private TenderRepository tenderRepository;

    @InjectMocks
    private OfficerDashboardService officerDashboardService;

    @Test
    @DisplayName("Test 1: should return correct dashboard metrics calculation")
    void shouldReturnCorrectDashboardMetrics() {
        // Given
        List<TenderStatus> activeStatuses = Arrays.asList(
                TenderStatus.PUBLISHED, TenderStatus.PENDING_OPENING, TenderStatus.OPEN
        );
        when(tenderRepository.countByStatusIn(activeStatuses)).thenReturn(10L);
        when(tenderRepository.countByStatus(TenderStatus.EVALUATION)).thenReturn(3L);
        when(tenderRepository.countByStatus(TenderStatus.AWARDED)).thenReturn(5L);
        when(tenderRepository.countByStatus(TenderStatus.NO_BID)).thenReturn(2L);

        // When
        DashboardMetricsResponse response = officerDashboardService.getMetrics();

        // Then
        assertNotNull(response);
        assertEquals(10L, response.getActive());
        assertEquals(3L, response.getEvaluating());
        assertEquals(5L, response.getAwarded());
        assertEquals(2L, response.getNoBids());
        assertEquals(0L, response.getBids()); // Default placeholder field
    }

    @Test
    @DisplayName("Test 2: should return tenders ready for bid opening")
    void shouldReturnTendersReadyForOpening() {
        // Given
        UUID tenderId = UUID.randomUUID();
        Tender tender = new Tender();
        tender.setId(tenderId);
        tender.setTenderNumber("TND-001");
        tender.setTitle("Infrastructure Construction Tender");
        tender.setStatus(TenderStatus.PUBLISHED);
        tender.setProcurementType(ProcurementType.WORKS);
        tender.setClosingDate(LocalDateTime.of(2026, 6, 20, 12, 0));

        List<TenderStatus> openingStatuses = Arrays.asList(
                TenderStatus.PUBLISHED, TenderStatus.PENDING_OPENING
        );
        when(tenderRepository.findAllByStatusIn(openingStatuses)).thenReturn(List.of(tender));

        // When
        List<OfficerTenderResponse> result = officerDashboardService.getTendersForOpening();

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        OfficerTenderResponse response = result.get(0);
        assertEquals(tenderId.toString(), response.getId());
        assertEquals("TND-001", response.getTenderNo());
        assertEquals("Infrastructure Construction Tender", response.getTitle());
        assertEquals("PENDING_OPENING", response.getStatus()); // mapToFrontendStatus maps PUBLISHED to PENDING_OPENING
        assertEquals("WORKS", response.getCategory());
        assertEquals("Officer", response.getRole());
    }
}
