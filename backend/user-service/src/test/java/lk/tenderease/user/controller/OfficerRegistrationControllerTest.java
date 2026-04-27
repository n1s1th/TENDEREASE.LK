package lk.tenderease.user.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import lk.tenderease.user.dto.request.AddressDTO;
import lk.tenderease.user.dto.request.CreateOfficerRegistrationRequest;
import lk.tenderease.user.dto.request.LiaisonOfficerDTO;
import lk.tenderease.user.dto.response.OfficerProfileResponse;
import lk.tenderease.user.dto.response.OfficerRegistrationSuccessResponse;
import lk.tenderease.user.enums.OfficerStatus;
import lk.tenderease.user.service.OfficerRegistrationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.bean.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for {@link OfficerRegistrationController}.
 * Uses MockMvc with {@code @WebMvcTest} to test endpoints.
 */
@WebMvcTest(OfficerRegistrationController.class)
class OfficerRegistrationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private OfficerRegistrationService officerRegistrationService;

    private CreateOfficerRegistrationRequest validRequest;

    @BeforeEach
    void setUp() {
        validRequest = CreateOfficerRegistrationRequest.builder()
                .procuringEntityType("Government Department")
                .headDesignation("Director")
                .organizationName("Ministry of Finance")
                .address(AddressDTO.builder()
                        .country("Sri Lanka")
                        .streetLine1("No 1 Main St")
                        .city("Colombo")
                        .build())
                .personalLandPhone("0112345678")
                .officialEmail("officer@gov.lk")
                .liaisonOfficer(LiaisonOfficerDTO.builder()
                        .title("Mr")
                        .name("John Doe")
                        .nic("123456789V")
                        .mobile("+94771234567")
                        .email("john@gov.lk")
                        .build())
                .termsAccepted(true)
                .build();
    }

    // ──────────────────────────────────────────────────────
    //  PUBLIC REGISTRATION ENDPOINT
    // ──────────────────────────────────────────────────────

    @Nested
    @DisplayName("POST /api/officers/register")
    class RegisterEndpoint {

        @Test
        @DisplayName("✅ Valid registration should return 201 with reference ID")
        void validRegistration_shouldReturn201() throws Exception {
            // Given
            OfficerRegistrationSuccessResponse successResponse =
                    OfficerRegistrationSuccessResponse.builder()
                            .success(true)
                            .message("Registration successful")
                            .data(OfficerRegistrationSuccessResponse.RegistrationData.builder()
                                    .referenceId("OFF-2026-000001")
                                    .build())
                            .build();

            when(officerRegistrationService.registerOfficer(any())).thenReturn(successResponse);

            // When / Then
            mockMvc.perform(post("/api/officers/register")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validRequest)))
                    .andDo(print())
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.message").value("Registration successful"))
                    .andExpect(jsonPath("$.data.referenceId").value("OFF-2026-000001"));
        }

        @Test
        @DisplayName("❌ Missing required fields should return 400")
        void missingRequiredFields_shouldReturn400() throws Exception {
            // Given - empty request
            CreateOfficerRegistrationRequest emptyRequest = CreateOfficerRegistrationRequest.builder().build();

            // When / Then
            mockMvc.perform(post("/api/officers/register")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(emptyRequest)))
                    .andDo(print())
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("❌ Invalid email format should return 400")
        void invalidEmail_shouldReturn400() throws Exception {
            // Given
            validRequest.setOfficialEmail("not-an-email");

            // When / Then
            mockMvc.perform(post("/api/officers/register")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validRequest)))
                    .andDo(print())
                    .andExpect(status().isBadRequest());
        }
    }

    // ──────────────────────────────────────────────────────
    //  ADMIN ENDPOINTS
    // ──────────────────────────────────────────────────────

    @Nested
    @DisplayName("Admin Endpoints")
    class AdminEndpoints {

        @Test
        @DisplayName("✅ Admin can get officer by ID")
        @WithMockUser(roles = "ADMIN")
        void adminGetOfficer_shouldReturn200() throws Exception {
            // Given
            UUID officerId = UUID.randomUUID();
            OfficerProfileResponse profile = OfficerProfileResponse.builder()
                    .officerId(officerId)
                    .registrationReference("OFF-2026-000001")
                    .status("PENDING")
                    .officialEmail("officer@gov.lk")
                    .build();

            when(officerRegistrationService.getOfficerById(officerId)).thenReturn(profile);

            // When / Then
            mockMvc.perform(get("/api/officers/" + officerId))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.registrationReference").value("OFF-2026-000001"));
        }

        @Test
        @DisplayName("❌ Non-admin should get 403 on admin endpoints")
        @WithMockUser(roles = "USER")
        void nonAdmin_shouldGet403() throws Exception {
            mockMvc.perform(get("/api/officers/" + UUID.randomUUID()))
                    .andDo(print())
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("✅ Admin can approve officer")
        @WithMockUser(roles = "ADMIN")
        void adminApprove_shouldReturn200() throws Exception {
            // Given
            UUID officerId = UUID.randomUUID();
            OfficerProfileResponse profile = OfficerProfileResponse.builder()
                    .officerId(officerId)
                    .registrationReference("OFF-2026-000001")
                    .status("APPROVED")
                    .build();

            when(officerRegistrationService.approveOfficer(officerId)).thenReturn(profile);

            // When / Then
            mockMvc.perform(post("/api/officers/" + officerId + "/approve")
                            .with(csrf()))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("APPROVED"));
        }

        @Test
        @DisplayName("✅ Admin can reject officer with reason")
        @WithMockUser(roles = "ADMIN")
        void adminReject_shouldReturn200() throws Exception {
            // Given
            UUID officerId = UUID.randomUUID();
            OfficerProfileResponse profile = OfficerProfileResponse.builder()
                    .officerId(officerId)
                    .registrationReference("OFF-2026-000001")
                    .status("REJECTED")
                    .build();

            when(officerRegistrationService.rejectOfficer(officerId, "Insufficient docs"))
                    .thenReturn(profile);

            // When / Then
            mockMvc.perform(post("/api/officers/" + officerId + "/reject")
                            .with(csrf())
                            .param("reason", "Insufficient docs"))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("REJECTED"));
        }

        @Test
        @DisplayName("✅ Admin can get officer by reference")
        @WithMockUser(roles = "ADMIN")
        void adminGetByReference_shouldReturn200() throws Exception {
            // Given
            OfficerProfileResponse profile = OfficerProfileResponse.builder()
                    .registrationReference("OFF-2026-000001")
                    .status("PENDING")
                    .build();

            when(officerRegistrationService.getOfficerByReference("OFF-2026-000001"))
                    .thenReturn(profile);

            // When / Then
            mockMvc.perform(get("/api/officers/reference/OFF-2026-000001"))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.registrationReference").value("OFF-2026-000001"));
        }
    }
}
