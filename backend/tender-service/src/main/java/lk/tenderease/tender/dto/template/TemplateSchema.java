package lk.tenderease.tender.dto.template;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TemplateSchema {
    private List<TemplateSection> sections;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TemplateSection {
        private String id;
        private String title;
        private String description;
        private List<TemplateField> fields;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TemplateField {
        private String id;
        private FieldType type;
        private String title;
        private String helperText;
        private boolean required;
        private boolean showInNotice;
        private List<FieldOption> options;
        private String validation;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FieldOption {
        private String id;
        private String label;
        private String value;
    }
    
    public enum FieldType {
        SHORT_ANSWER, PARAGRAPH, CHECKBOXES, DROPDOWN, DATE, TIME, 
        FILE_UPLOAD, NUMBER, DOCUMENT_UPLOAD, CURRENCY
    }
}
