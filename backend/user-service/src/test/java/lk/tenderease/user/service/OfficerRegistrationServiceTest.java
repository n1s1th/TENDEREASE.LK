package lk.tenderease.user.service;

import lk.tenderease.user.dto.request.AddressDTO;
import lk.tenderease.user.dto.request.CreateOfficerRegistrationRequest;
import lk.tenderease.user.dto.request.LiaisonOfficerDTO;
import lk.tenderease.user.dto.response.OfficerProfileResponse;
import lk.tenderease.user.dto.response.OfficerRegistrationSuccessResponse;
import lk.tenderease.user.entity.Address;
import lk.tenderease.user.entity.LiaisonOfficer;
import lk.tenderease.user.entity.Officer;
import lk.tenderease.user.enums.OfficerStatus;
import lk.tenderease.user.event.OfficerEventPublisher;
import lk.tenderease.user.exception.InvalidOfficerStatusException;
import lk.tenderease.user.exception.OfficerNotFoundException;
import lk.tenderease.user.exception.OfficerRegistrationException;
import lk.tenderease.user.repository.LiaisonOfficerRepository;
import lk.tenderease.user.repository.OfficerRepository;
import lk.tenderease.user.repository.RegistrationAuditRepository;
import lk.tenderease.user.service.impl.OfficerRegistrationServiceImpl;
import lk.tenderease.user.util.ReferenceIdGenerator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for {@link OfficerRegistrationServiceImpl}.
 * Uses Mockito for dependency mocking.
 *
 * <p>Test coverage targets: 80%+</p>
 */
@ExtendWith(MockitoExtension.class)
class OfficerRegistrationServiceTest {

    @Mock
    private OfficerRepository officerRepository;

    @Mock
    private LiaisonOfficerRepository liaisonOfficerRepository;

    @Mock
    private RegistrationAuditRepository registrationAuditRepository;

    @Mock
    private ReferenceIdGenerator referenceIdGenerator;

    @Mock
    private OfficerEventPublisher eventPublisher;

    @InjectMocks
    private OfficerRegistrationServiceImpl officerRegistrationService;

    private CreateOfficerRegistrationRequest validRequest;
    private Officer savedOfficer;

    @BeforeEach
    void setUp() {
        // Build a valid registration request
        validRequest = CreateOfficerRegistrationRequest.builder()
                .procuringEntityType("Government Department")
                .headDesignation("Director")
                .organizationName("Ministry of Finance")
                .address(AddressDTO.builder()
                        .country("Sri Lanka")
                        .streetLine1("No 1 Main St")
                        .city("Colombo")
                        .province("Western")
                        .postalCode("00100")
                        .build())
                .personalLandPhone("0112345678")
                .officialEmail("officer@gov.lk")
                .businessRegistrationNumber("BR-2026-001234")
                .vatRegistrationNumber("VAT-2026-001234")
                .liaisonOfficer(LiaisonOfficerDTO.builder()
                        .title("Mr")
                        .name("John Doe")
                        .designation("Senior Officer")
                        .nic("123456789V")
                        .mobile("+94771234567")
                        .email("john@gov.lk")
                        .build())
                .termsAccepted(true)
                .build();

        // Build a saved officer entity for mock returns
        savedOfficer = Officer.builder()
                .procuringEntityType("Government Department")
                .headDesignation("Director")
                .organizationName("Ministry of Finance")
                .address(Address.builder()
                        .country("Sri Lanka")
                        .streetLine1("No 1 Main St")
                        .city("Colombo")
                        .build())
                .personalLandPhone("0112345678")
                .officialEmail("officer@gov.lk")
                .registrationReference("OFF-2026-000001")
                .status(OfficerStatus.PENDING)
                .termsAccepted(true)
                .build();

        // Set the ID via reflection since BaseEntity uses @GeneratedValue
        try {
            var idField = lk.tenderease.common.entity.BaseEntity.class.getDeclaredField("id");
            idField.setAccessible(true);
            idField.set(savedOfficer, UUID.randomUUID());
        } catch (Exception e) {
            // ignore
        }

        // Set liaison officer
        LiaisonOfficer liaison = LiaisonOfficer.builder()
                .title("Mr")
                .name("John Doe")
                .designation("Senior Officer")
                .nic("123456789V")
                .mobile("+94771234567")
                .email("john@gov.lk")
                .build();
        savedOfficer.setLiaisonOfficer(liaison);
    }

    // ──────────────────────────────────────────────────────
    //  REGISTRATION TESTS
    // ──────────────────────────────────────────────────────

    @Nested
    @DisplayName("Registration Tests")
    class RegistrationTests {

        @Test
        @DisplayName("✅ Valid registration should succeed and return reference ID")
        void validRegistration_shouldSucceed() {
            // Given
            when(officerRepository.existsByOfficialEmail(anyString())).thenReturn(false);
            when(liaisonOfficerRepository.existsByNic(anyString())).thenReturn(false);
            when(referenceIdGenerator.generateRegistrationReference()).thenReturn("OFF-2026-000001");
            when(officerRepository.save(any(Officer.class))).thenReturn(savedOfficer);

            // When
            OfficerRegistrationSuccessResponse response = officerRegistrationService.registerOfficer(validRequest);

            // Then
            assertThat(response).isNotNull();
            assertThat(response.isSuccess()).isTrue();
            assertThat(response.getMessage()).isEqualTo("Registration successful");
            assertThat(response.getData().getReferenceId()).isEqualTo("OFF-2026-000001");

            verify(officerRepository).save(any(Officer.class));
            verify(registrationAuditRepository).save(any());
            verify(eventPublisher).publishRegistered(any());
        }

        @Test
        @DisplayName("❌ Duplicate email should fail with error list")
        void duplicateEmail_shouldFail() {
            // Given
            when(officerRepository.existsByOfficialEmail("officer@gov.lk")).thenReturn(true);
            when(liaisonOfficerRepository.existsByNic(anyString())).thenReturn(false);
            when(referenceIdGenerator.generateSupportId()).thenReturn("ERR-REG-2026-000001");

            // When / Then
            OfficerRegistrationException ex = catchThrowableOfType(
                    () -> officerRegistrationService.registerOfficer(validRequest),
                    OfficerRegistrationException.class
            );

            assertThat(ex).isNotNull();
            assertThat(ex.getErrors()).contains("Email already registered");
            assertThat(ex.getSupportId()).isEqualTo("ERR-REG-2026-000001");

            verify(officerRepository, never()).save(any());
        }

        @Test
        @DisplayName("❌ Invalid NIC format should fail with error")
        void invalidNIC_shouldFail() {
            // Given - set an invalid NIC
            validRequest.getLiaisonOfficer().setNic("INVALID_NIC");
            when(officerRepository.existsByOfficialEmail(anyString())).thenReturn(false);
            when(liaisonOfficerRepository.existsByNic(anyString())).thenReturn(false);
            when(referenceIdGenerator.generateSupportId()).thenReturn("ERR-REG-2026-000002");

            // When / Then
            OfficerRegistrationException ex = catchThrowableOfType(
                    () -> officerRegistrationService.registerOfficer(validRequest),
                    OfficerRegistrationException.class
            );

            assertThat(ex).isNotNull();
            assertThat(ex.getErrors()).contains("NIC format incorrect");
            assertThat(ex.getSupportId()).isEqualTo("ERR-REG-2026-000002");
        }

        @Test
        @DisplayName("❌ Duplicate NIC should fail with error")
        void duplicateNIC_shouldFail() {
            // Given
            when(officerRepository.existsByOfficialEmail(anyString())).thenReturn(false);
            when(liaisonOfficerRepository.existsByNic("123456789V")).thenReturn(true);
            when(referenceIdGenerator.generateSupportId()).thenReturn("ERR-REG-2026-000003");

            // When / Then
            OfficerRegistrationException ex = catchThrowableOfType(
                    () -> officerRegistrationService.registerOfficer(validRequest),
                    OfficerRegistrationException.class
            );

            assertThat(ex).isNotNull();
            assertThat(ex.getErrors()).contains("NIC already registered for another liaison officer");
        }

        @Test
        @DisplayName("❌ Multiple validation errors should be collected together")
        void multipleErrors_shouldBeCollected() {
            // Given - both email and NIC are duplicates, and NIC is invalid
            validRequest.getLiaisonOfficer().setNic("BAD");
            when(officerRepository.existsByOfficialEmail("officer@gov.lk")).thenReturn(true);
            when(liaisonOfficerRepository.existsByNic("BAD")).thenReturn(true);
            when(referenceIdGenerator.generateSupportId()).thenReturn("ERR-REG-2026-000004");

            // When / Then
            OfficerRegistrationException ex = catchThrowableOfType(
                    () -> officerRegistrationService.registerOfficer(validRequest),
                    OfficerRegistrationException.class
            );

            assertThat(ex).isNotNull();
            assertThat(ex.getErrors()).hasSize(3);
            assertThat(ex.getErrors()).contains("Email already registered");
            assertThat(ex.getErrors()).contains("NIC format incorrect");
            assertThat(ex.getErrors()).contains("NIC already registered for another liaison officer");
        }

        @Test
        @DisplayName("✅ Reference ID format should be OFF-YYYY-XXXXXX")
        void referenceId_shouldHaveCorrectFormat() {
            // Given
            when(officerRepository.existsByOfficialEmail(anyString())).thenReturn(false);
            when(liaisonOfficerRepository.existsByNic(anyString())).thenReturn(false);
            when(referenceIdGenerator.generateRegistrationReference()).thenReturn("OFF-2026-000042");
            when(officerRepository.save(any(Officer.class))).thenReturn(savedOfficer);

            // When
            OfficerRegistrationSuccessResponse response = officerRegistrationService.registerOfficer(validRequest);

            // Then
            verify(referenceIdGenerator).generateRegistrationReference();
            assertThat(response.getData().getReferenceId()).matches("OFF-\\d{4}-\\d{6}");
        }

        @Test
        @DisplayName("✅ Valid 12-digit NIC should pass validation")
        void newNICFormat_shouldPassValidation() {
            // Given
            validRequest.getLiaisonOfficer().setNic("200012345678");
            when(officerRepository.existsByOfficialEmail(anyString())).thenReturn(false);
            when(liaisonOfficerRepository.existsByNic(anyString())).thenReturn(false);
            when(referenceIdGenerator.generateRegistrationReference()).thenReturn("OFF-2026-000005");
            when(officerRepository.save(any(Officer.class))).thenReturn(savedOfficer);

            // When
            OfficerRegistrationSuccessResponse response = officerRegistrationService.registerOfficer(validRequest);

            // Then
            assertThat(response.isSuccess()).isTrue();
        }
    }

    // ──────────────────────────────────────────────────────
    //  APPROVE / REJECT TESTS
    // ──────────────────────────────────────────────────────

    @Nested
    @DisplayName("Approval/Rejection Tests")
    class ApprovalTests {

        @Test
        @DisplayName("✅ Approve PENDING officer should succeed")
        void approvePending_shouldSucceed() {
            // Given
            UUID officerId = savedOfficer.getId();
            when(officerRepository.findById(officerId)).thenReturn(Optional.of(savedOfficer));
            when(officerRepository.save(any(Officer.class))).thenReturn(savedOfficer);

            // When
            OfficerProfileResponse response = officerRegistrationService.approveOfficer(officerId);

            // Then
            assertThat(response).isNotNull();
            verify(officerRepository).save(any(Officer.class));
            verify(eventPublisher).publishApproved(any());
        }

        @Test
        @DisplayName("❌ Approve already APPROVED officer should fail")
        void approveApproved_shouldFail() {
            // Given
            savedOfficer.setStatus(OfficerStatus.APPROVED);
            UUID officerId = savedOfficer.getId();
            when(officerRepository.findById(officerId)).thenReturn(Optional.of(savedOfficer));

            // When / Then
            assertThatThrownBy(() -> officerRegistrationService.approveOfficer(officerId))
                    .isInstanceOf(InvalidOfficerStatusException.class);
        }

        @Test
        @DisplayName("✅ Reject PENDING officer should succeed")
        void rejectPending_shouldSucceed() {
            // Given
            UUID officerId = savedOfficer.getId();
            when(officerRepository.findById(officerId)).thenReturn(Optional.of(savedOfficer));
            when(officerRepository.save(any(Officer.class))).thenReturn(savedOfficer);

            // When
            OfficerProfileResponse response = officerRegistrationService.rejectOfficer(officerId, "Insufficient documents");

            // Then
            assertThat(response).isNotNull();
            verify(eventPublisher).publishRejected(any());
        }

        @Test
        @DisplayName("❌ Reject already REJECTED officer should fail")
        void rejectRejected_shouldFail() {
            // Given
            savedOfficer.setStatus(OfficerStatus.REJECTED);
            UUID officerId = savedOfficer.getId();
            when(officerRepository.findById(officerId)).thenReturn(Optional.of(savedOfficer));

            // When / Then
            assertThatThrownBy(() -> officerRegistrationService.rejectOfficer(officerId, "reason"))
                    .isInstanceOf(InvalidOfficerStatusException.class);
        }

        @Test
        @DisplayName("❌ Approve non-existent officer should throw 404")
        void approveNotFound_shouldThrow404() {
            // Given
            UUID randomId = UUID.randomUUID();
            when(officerRepository.findById(randomId)).thenReturn(Optional.empty());

            // When / Then
            assertThatThrownBy(() -> officerRegistrationService.approveOfficer(randomId))
                    .isInstanceOf(OfficerNotFoundException.class);
        }
    }

    // ──────────────────────────────────────────────────────
    //  GET / LOOKUP TESTS
    // ──────────────────────────────────────────────────────

    @Nested
    @DisplayName("Lookup Tests")
    class LookupTests {

        @Test
        @DisplayName("✅ Get officer by reference should return profile")
        void getByReference_shouldReturnProfile() {
            // Given
            when(officerRepository.findByRegistrationReference("OFF-2026-000001"))
                    .thenReturn(Optional.of(savedOfficer));

            // When
            OfficerProfileResponse response = officerRegistrationService.getOfficerByReference("OFF-2026-000001");

            // Then
            assertThat(response).isNotNull();
            assertThat(response.getOfficialEmail()).isEqualTo("officer@gov.lk");
        }

        @Test
        @DisplayName("❌ Get officer by invalid reference should throw 404")
        void getByInvalidReference_shouldThrow404() {
            // Given
            when(officerRepository.findByRegistrationReference("INVALID"))
                    .thenReturn(Optional.empty());

            // When / Then
            assertThatThrownBy(() -> officerRegistrationService.getOfficerByReference("INVALID"))
                    .isInstanceOf(OfficerNotFoundException.class);
        }

        @Test
        @DisplayName("✅ Get officer by ID should return profile")
        void getById_shouldReturnProfile() {
            // Given
            UUID officerId = savedOfficer.getId();
            when(officerRepository.findById(officerId)).thenReturn(Optional.of(savedOfficer));

            // When
            OfficerProfileResponse response = officerRegistrationService.getOfficerById(officerId);

            // Then
            assertThat(response).isNotNull();
            assertThat(response.getOfficerId()).isEqualTo(officerId);
        }
    }
}
