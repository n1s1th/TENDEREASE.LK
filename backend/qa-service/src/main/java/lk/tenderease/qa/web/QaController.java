package lk.tenderease.qa.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lk.tenderease.qa.domain.QuestionCategory;
import lk.tenderease.qa.domain.QuestionStatus;
import lk.tenderease.qa.dto.AnswerQuestionRequest;
import lk.tenderease.qa.dto.CreateQuestionRequest;
import lk.tenderease.qa.dto.QuestionResponse;
import lk.tenderease.qa.service.QuestionService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Public Q&A")
@RestController
@RequestMapping("/api/qa")
public class QaController {

    private final QuestionService questionService;

    public QaController(QuestionService questionService) {
        this.questionService = questionService;
    }

    @Operation(summary = "List public questions", description = "Returns platform-wide public questions with optional category filtering.")
    @GetMapping("/questions")
    public Page<QuestionResponse> getPublicQuestions(
            @RequestParam(required = false) QuestionCategory category,
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable
    ) {
        return questionService.getPublicQuestions(category, pageable);
    }

    @Operation(summary = "Get a public question", description = "Returns a single question and its answer when answered.")
    @GetMapping("/questions/{id}")
    public QuestionResponse getQuestion(@PathVariable Long id) {
        return questionService.getQuestion(id);
    }

    @Operation(summary = "Submit a public question", description = "Anyone can submit a question — authentication is optional.")
    @PostMapping("/questions")
    @ResponseStatus(HttpStatus.CREATED)
    public QuestionResponse createQuestion(@Valid @RequestBody CreateQuestionRequest request) {
        return questionService.createQuestion(request);
    }

    @Operation(summary = "List my submitted questions")
    @GetMapping("/my-questions")
    @PreAuthorize("hasRole('USER')")
    public Page<QuestionResponse> getMyQuestions(@PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
        return questionService.getMyQuestions(pageable);
    }

    @Operation(summary = "Admin/Officer list of all questions")
    @GetMapping("/admin/questions")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROCUREMENT_OFFICER', 'OFFICER')")
    public Page<QuestionResponse> getAdminQuestions(@PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
        return questionService.getAdminQuestions(pageable);
    }

    @Operation(summary = "Officer list of questions by status", description = "Returns questions filtered by PENDING or ANSWERED status.")
    @GetMapping("/officer/questions")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROCUREMENT_OFFICER', 'OFFICER')")
    public Page<QuestionResponse> getOfficerQuestions(
            @RequestParam(required = false) QuestionStatus status,
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable
    ) {
        if (status != null) {
            return questionService.getQuestionsByStatus(status, pageable);
        }
        return questionService.getAdminQuestions(pageable);
    }

    @Operation(summary = "Answer a question", description = "Creates the single allowed answer for a pending question.")
    @PostMapping("/questions/{id}/answer")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROCUREMENT_OFFICER', 'OFFICER')")
    public QuestionResponse answerQuestion(
            @PathVariable Long id,
            @Valid @RequestBody AnswerQuestionRequest request
    ) {
        return questionService.answerQuestion(id, request);
    }
}

