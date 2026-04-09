package lk.tenderease.tender.service;

import lk.tenderease.tender.dto.request.ClarificationRequestDTO;
import lk.tenderease.tender.dto.response.*;
import lk.tenderease.tender.enums.TenderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface TenderService {

    Page<TenderSummaryDTO> getAllPublishedTenders(String search, TenderStatus status, Pageable pageable);

    TenderDetailsDTO getTenderById(UUID id);

    List<TenderDocumentDTO> getDocuments( UUID tenderId);

    List<TenderAmendmentDTO> getAddenda(UUID tenderId);

    List<ClarificationDTO> getClarifications( UUID tenderId);

    List<TimelineDTO> getTimeline(UUID tenderId);

    List<ContactDTO> getContacts(UUID tenderId);

    void submitClarification(UUID tenderId, ClarificationRequestDTO request);
}