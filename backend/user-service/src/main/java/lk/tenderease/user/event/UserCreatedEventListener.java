package lk.tenderease.user.event;

import lk.tenderease.user.entity.Officer;
import lk.tenderease.user.repository.OfficerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Optional;

/**
 * Listener for UserCreated events from the Auth (Keycloak) Service.
 *
 * <p>When a Keycloak user is created during the approval flow,
 * this listener links the Keycloak user ID back to the officer profile.</p>
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class UserCreatedEventListener {

    private final OfficerRepository officerRepository;

    /**
     * Handle UserCreated event from Auth Service.
     * Links the Keycloak user ID to the officer profile by email.
     *
     * @param event the user created event payload
     */
    @RabbitListener(queues = "user.created.queue")
    public void handleUserCreated(Map<String, String> event) {
        final String email = event.get("email");
        final String keycloakUserId = event.get("keycloakUserId");

        if (email == null || keycloakUserId == null) {
            log.warn("Received UserCreated event with missing email or keycloakUserId: {}", event);
            return;
        }

        log.info("Received UserCreated event [email={}, keycloakUserId={}]", email, keycloakUserId);

        try {
            final Optional<Officer> officerOpt = officerRepository.findByOfficialEmail(email);
            if (officerOpt.isPresent()) {
                final Officer officer = officerOpt.get();
                officer.setKeycloakUserId(keycloakUserId);
                officerRepository.save(officer);
                log.info("Linked Keycloak user {} to officer {} (ref: {})",
                        keycloakUserId, officer.getId(), officer.getRegistrationReference());
            } else {
                log.warn("No officer found with email {} for UserCreated event", email);
            }
        } catch (Exception e) {
            log.error("Error processing UserCreated event for email {}: {}", email, e.getMessage(), e);
        }
    }
}
