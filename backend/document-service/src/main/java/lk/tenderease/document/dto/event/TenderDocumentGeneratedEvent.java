package lk.tenderease.document.dto.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TenderDocumentGeneratedEvent {
    private UUID tenderId;
    private String tenderNumber;
    private String title;
    private byte[] pdfContent;
    private String fileName;
}
