package lk.tenderease.user.event;

import lk.tenderease.user.entity.Officer;
import lk.tenderease.user.repository.OfficerRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserCreatedEventListenerTest {

    @Mock
    private OfficerRepository officerRepository;

    @InjectMocks
    private UserCreatedEventListener userCreatedEventListener;

    private Map<String, String> validEvent;
    private Officer officer;

    @BeforeEach
    void setUp() {
        validEvent = new HashMap<>();
        validEvent.put("email", "officer@gov.lk");
        validEvent.put("keycloakUserId", "keycloak-user-uuid-1234");

        officer = Officer.builder()
                .officialEmail("officer@gov.lk")
                .organizationName("Ministry of Transport")
                .build();
    }

    @Test
    @DisplayName("Should link keycloakUserId to officer profile when email matches")
    void shouldLinkKeycloakUserIdToOfficer() {
        // Given
        when(officerRepository.findByOfficialEmail("officer@gov.lk")).thenReturn(Optional.of(officer));

        // When
        userCreatedEventListener.handleUserCreated(validEvent);

        // Then
        verify(officerRepository, times(1)).findByOfficialEmail("officer@gov.lk");
        
        ArgumentCaptor<Officer> officerCaptor = ArgumentCaptor.forClass(Officer.class);
        verify(officerRepository, times(1)).save(officerCaptor.capture());
        
        Officer savedOfficer = officerCaptor.getValue();
        assertThat(savedOfficer.getKeycloakUserId()).isEqualTo("keycloak-user-uuid-1234");
    }

    @Test
    @DisplayName("Should not link keycloakUserId if email does not exist in DB")
    void shouldNotLinkIfEmailNotFound() {
        // Given
        when(officerRepository.findByOfficialEmail("officer@gov.lk")).thenReturn(Optional.empty());

        // When
        userCreatedEventListener.handleUserCreated(validEvent);

        // Then
        verify(officerRepository, times(1)).findByOfficialEmail("officer@gov.lk");
        verify(officerRepository, never()).save(any(Officer.class));
    }

    @Test
    @DisplayName("Should return early and log warning if event has missing email or user ID")
    void shouldIgnoreMissingDataEvent() {
        // Given
        Map<String, String> invalidEvent = new HashMap<>();
        invalidEvent.put("email", "officer@gov.lk");
        // missing keycloakUserId

        // When
        userCreatedEventListener.handleUserCreated(invalidEvent);

        // Then
        verifyNoInteractions(officerRepository);
    }
}
