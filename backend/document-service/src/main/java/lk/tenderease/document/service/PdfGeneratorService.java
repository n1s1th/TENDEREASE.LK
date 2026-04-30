package lk.tenderease.document.service;

import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import lk.tenderease.tender.dto.response.TenderDetailResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.io.ByteArrayOutputStream;

@Slf4j
@Service
@RequiredArgsConstructor
public class PdfGeneratorService {

    private final TemplateEngine templateEngine;

    public byte[] generateTenderReviewPdf(TenderDetailResponse tender) {
        log.info("Generating PDF for tender: {}", tender.getTenderNumber());
        try {
            Context context = new Context();
            context.setVariable("tender", tender);

            String htmlContent = templateEngine.process("tender-review", context);

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            PdfRendererBuilder builder = new PdfRendererBuilder();
            builder.withHtmlContent(htmlContent, "/");
            builder.toStream(outputStream);
            builder.run();

            return outputStream.toByteArray();
        } catch (Exception e) {
            log.error("Error generating PDF for tender {}: {}", tender.getTenderNumber(), e.getMessage());
            throw new RuntimeException("Failed to generate PDF", e);
        }
    }
}
