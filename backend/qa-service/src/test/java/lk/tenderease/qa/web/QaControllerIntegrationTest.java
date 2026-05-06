package lk.tenderease.qa.web;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class QaControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void createQuestionAndListPublicQuestions() throws Exception {
        mockMvc.perform(post("/api/qa/questions")
                        .header("X-User-Id", "vendor-123")
                        .header("X-Roles", "ROLE_USER")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "questionText": "How do I register?",
                                  "category": "REGISTRATION"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.userId").value("vendor-123"))
                .andExpect(jsonPath("$.status").value("PENDING"));

        mockMvc.perform(get("/api/qa/questions?category=REGISTRATION"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].questionText").value("How do I register?"));
    }

    @Test
    void answerQuestionRequiresAdminAndRejectsDuplicateAnswer() throws Exception {
        String location = mockMvc.perform(post("/api/qa/questions")
                        .header("X-User-Id", "vendor-456")
                        .header("X-Roles", "ROLE_USER")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "questionText": "How do payment confirmations work?",
                                  "category": "PAYMENTS"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andReturn()
                .getResponse()
                .getContentAsString();

        Long id = Long.valueOf(location.replaceAll(".*\\\"id\\\":(\\d+).*", "$1"));

        mockMvc.perform(post("/api/qa/questions/" + id + "/answer")
                        .header("X-User-Id", "vendor-456")
                        .header("X-Roles", "ROLE_USER")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"answerText\":\"Not allowed.\"}"))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/api/qa/questions/" + id + "/answer")
                        .header("X-User-Id", "admin-1")
                        .header("X-Roles", "ROLE_ADMIN")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"answerText\":\"You will see it in your account.\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ANSWERED"))
                .andExpect(jsonPath("$.answer.answeredBy").value("admin-1"));

        mockMvc.perform(post("/api/qa/questions/" + id + "/answer")
                        .header("X-User-Id", "admin-1")
                        .header("X-Roles", "ROLE_ADMIN")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"answerText\":\"Second answer.\"}"))
                .andExpect(status().isConflict());
    }
}
