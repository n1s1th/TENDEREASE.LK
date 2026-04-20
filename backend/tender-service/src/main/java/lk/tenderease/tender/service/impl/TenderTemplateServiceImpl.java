package lk.tenderease.tender.service.impl;

import lk.tenderease.common.exception.BusinessException;
import lk.tenderease.tender.dto.template.TenderTemplateRequest;
import lk.tenderease.tender.dto.template.TenderTemplateResponse;
import lk.tenderease.tender.entity.TenderTemplate;
import lk.tenderease.tender.enums.TemplateStatus;
import lk.tenderease.tender.repository.TenderTemplateRepository;
import lk.tenderease.tender.service.TenderTemplateService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TenderTemplateServiceImpl implements TenderTemplateService {

    private final TenderTemplateRepository repository;

    @Override
    @Transactional
    public TenderTemplateResponse createTemplate(TenderTemplateRequest request) {
        TenderTemplate template = TenderTemplate.builder()
                .templateCode(UUID.randomUUID().toString()) // Unique code for version family
                .name(request.getName())
                .description(request.getDescription())
                .schema(request.getSchema())
                .version(1)
                .status(TemplateStatus.DRAFT)
                .isActive(false)
                .build();
        
        template = repository.save(template);
        log.info("Created new template draft with id {}", template.getId());
        return mapToResponse(template);
    }

    @Override
    @Transactional
    public TenderTemplateResponse updateTemplate(UUID id, TenderTemplateRequest request) {
        TenderTemplate existingTemplate = repository.findById(id)
                .orElseThrow(() -> new BusinessException("Template not found with id: " + id));

        if (existingTemplate.getStatus() == TemplateStatus.ARCHIVED) {
            throw new BusinessException("Cannot update an archived template");
        }

        if (existingTemplate.getStatus() == TemplateStatus.PUBLISHED) {
            // Versioning logic: Clone and create new draft
            log.info("Cloning published template {} to create a new draft version", id);
            
            // Check if a draft already exists for this template code
            List<TenderTemplate> history = repository.findAllByTemplateCodeOrderByVersionDesc(existingTemplate.getTemplateCode());
            if (history.stream().anyMatch(t -> t.getStatus() == TemplateStatus.DRAFT)) {
                throw new BusinessException("A DRAFT version already exists for this template. Please update the draft instead.");
            }
            
            TenderTemplate newDraft = TenderTemplate.builder()
                    .templateCode(existingTemplate.getTemplateCode())
                    .name(request.getName())
                    .description(request.getDescription())
                    .schema(request.getSchema())
                    .version(existingTemplate.getVersion() + 1)
                    .status(TemplateStatus.DRAFT)
                    .isActive(false)
                    .build();
                    
            newDraft = repository.save(newDraft);
            return mapToResponse(newDraft);
        }

        // Updating a DRAFT
        existingTemplate.setName(request.getName());
        existingTemplate.setDescription(request.getDescription());
        existingTemplate.setSchema(request.getSchema());
        
        existingTemplate = repository.save(existingTemplate);
        return mapToResponse(existingTemplate);
    }

    @Override
    public TenderTemplateResponse getTemplate(UUID id) {
        return repository.findById(id)
                .map(this::mapToResponse)
                .orElseThrow(() -> new BusinessException("Template not found"));
    }

    @Override
    public List<TenderTemplateResponse> getActiveTemplates() {
        return repository.findAllByIsActiveTrue().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public TenderTemplateResponse publishTemplate(UUID id) {
        TenderTemplate template = repository.findById(id)
                .orElseThrow(() -> new BusinessException("Template not found"));

        if (template.getStatus() != TemplateStatus.DRAFT) {
            throw new BusinessException("Only DRAFT templates can be published");
        }

        // Deactivate all existing versions of this template code
        List<TenderTemplate> olderVersions = repository.findAllByTemplateCodeOrderByVersionDesc(template.getTemplateCode());
        for (TenderTemplate oldT : olderVersions) {
            oldT.setActive(false);
            repository.save(oldT);
        }

        template.setStatus(TemplateStatus.PUBLISHED);
        template.setActive(true);
        template = repository.save(template);
        
        log.info("Published template {} as active version {}", template.getTemplateCode(), template.getVersion());
        return mapToResponse(template);
    }

    @Override
    @Transactional
    public void archiveTemplate(UUID id) {
        TenderTemplate template = repository.findById(id)
                .orElseThrow(() -> new BusinessException("Template not found"));
        
        template.setStatus(TemplateStatus.ARCHIVED);
        template.setActive(false);
        repository.save(template);
    }

    private TenderTemplateResponse mapToResponse(TenderTemplate template) {
        return TenderTemplateResponse.builder()
                .id(template.getId())
                .templateCode(template.getTemplateCode())
                .name(template.getName())
                .description(template.getDescription())
                .version(template.getVersion())
                .status(template.getStatus())
                .isActive(template.isActive())
                .schema(template.getSchema())
                .createdAt(template.getCreatedAt())
                .updatedAt(template.getUpdatedAt())
                .build();
    }
}
