package lk.tenderease.tender.dto.response;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
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
@JsonIgnoreProperties(ignoreUnknown = true)
public class TenderDetailResponse extends TenderResponse {
    private List<TenderDocumentResponse> documents;
    private TenderScheduleResponse schedule;
    private ComplianceChecklistResponse complianceChecklist;
    private String noticePreview;
}
