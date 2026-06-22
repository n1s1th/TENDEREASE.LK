package lk.tenderease.tender.service.impl;

import lk.tenderease.tender.dto.response.TenderResponse;
import lk.tenderease.tender.entity.Tender;
import lk.tenderease.tender.enums.TenderStatus;
import lk.tenderease.tender.repository.*;
import lk.tenderease.tender.producer.NotificationProducer;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.rabbit.core.RabbitTemplate;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TenderServiceImplTest {

    @Mock private MinistryRepository ministryRepository;
    @Mock private DepartmentRepository departmentRepository;
    @Mock private FundingSourceRepository fundingSourceRepository;
    @Mock private SbdTemplateRepository sbdTemplateRepository;
    @Mock private TenderRepository tenderRepository;
    @Mock private TenderDocumentRepository documentRepository;
    @Mock private TenderAmendmentRepository amendmentRepository;
    @Mock private TenderClarificationRepository clarificationRepository;
    @Mock private ClarificationResponseRepository responseRepository;
    @Mock private TenderTimelineRepository timelineRepository;
    @Mock private TenderContactRepository contactRepository;
    @Mock private TenderScheduleRepository scheduleRepository;
    @Mock private NotificationProducer notificationProducer;
    @Mock private RabbitTemplate rabbitTemplate;

    @InjectMocks
    private TenderServiceImpl tenderService;

    @Test
    @DisplayName("Test 3: should approve tender status transition successfully")
    void shouldApproveTenderSuccessfully() {
        // Given
        UUID tenderId = UUID.randomUUID();
        Tender tender = new Tender();
        tender.setId(tenderId);
        tender.setTenderNumber("TND-2026-001");
        tender.setTitle("National Road Development Project");
        tender.setStatus(TenderStatus.PENDING_APPROVAL);

        when(tenderRepository.findById(tenderId)).thenReturn(Optional.of(tender));
        when(tenderRepository.save(any(Tender.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // When
        TenderResponse response = tenderService.updateTenderStatus(
                tenderId,
                TenderStatus.APPROVED,
                "Approved by Chief Administrative Officer",
                "cao-user"
        );

        // Then
        assertNotNull(response);
        assertEquals(TenderStatus.APPROVED, tender.getStatus());
        assertEquals("Approved by Chief Administrative Officer", tender.getRejectionReason());
        verify(tenderRepository).save(tender);
    }
}
