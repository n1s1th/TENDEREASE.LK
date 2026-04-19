package lk.tenderease.tender.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.util.List;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class TenderDetailResponse extends TenderResponse {
    private List<TenderDocumentResponse> documents;
    private TenderScheduleResponse schedule;
    private ComplianceChecklistResponse complianceChecklist;
    private String noticePreview;
}
