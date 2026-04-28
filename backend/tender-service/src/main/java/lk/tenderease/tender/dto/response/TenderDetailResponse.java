package lk.tenderease.tender.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
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
@Schema(description = "Full tender detail response including documents, schedule, checklist, and notice preview")
public class TenderDetailResponse extends TenderResponse {

    @Schema(description = "List of documents attached to the tender")
    private List<TenderDocumentResponse> documents;

    @Schema(description = "Tender schedule with key dates")
    private TenderScheduleResponse schedule;

    @Schema(description = "Compliance checklist state")
    private ComplianceChecklistResponse complianceChecklist;

    @Schema(description = "List of amendments/addenda issued for this tender")
    private List<TenderAmendmentResponse> addenda;

    @Schema(description = "Auto-generated notice preview text (Invitation for Bids)")
    private String noticePreview;
}
