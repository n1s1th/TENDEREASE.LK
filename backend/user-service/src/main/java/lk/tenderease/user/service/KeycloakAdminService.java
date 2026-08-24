package lk.tenderease.user.service;

import lombok.extern.slf4j.Slf4j;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;
import org.keycloak.admin.client.resource.RealmResource;
import org.keycloak.admin.client.resource.UserResource;
import org.keycloak.representations.idm.RoleRepresentation;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Slf4j
@Service
public class KeycloakAdminService {

    private final Keycloak keycloak;
    private final String realm;

    public KeycloakAdminService(
            @Value("${spring.keycloak.admin.server-url:${KEYCLOAK_ADMIN_URL:http://158.178.227.145:8080}}") String serverUrl,
            @Value("${spring.keycloak.admin.realm:${KEYCLOAK_REALM:tenderease}}") String realm,
            @Value("${spring.keycloak.admin.client-id:${KEYCLOAK_ADMIN_CLIENT_ID:tenderease-backend}}") String clientId,
            @Value("${spring.keycloak.admin.client-secret:${KEYCLOAK_ADMIN_CLIENT_SECRET:UdiHyV4TMypLJQqBsqOXDrltJaG5TK7O}}") String clientSecret) {
        
        this.realm = realm;
        
        log.info("Initializing Keycloak Admin Client for URL: {}, Realm: {}, ClientId: {}", serverUrl, realm, clientId);
        this.keycloak = KeycloakBuilder.builder()
                .serverUrl(serverUrl)
                .realm(realm)
                .clientId(clientId)
                .clientSecret(clientSecret)
                .grantType("client_credentials")
                .build();
    }

    /**
     * Assigns a role to a Keycloak user.
     *
     * @param keycloakUserId The user's ID in Keycloak.
     * @param roleName       The name of the role to assign (e.g., "PROCUREMENT_OFFICER").
     */
    public void assignRoleToUser(String keycloakUserId, String roleName) {
        if (keycloakUserId == null || keycloakUserId.isBlank()) {
            log.warn("Cannot assign role '{}' because keycloakUserId is missing", roleName);
            return;
        }

        try {
            RealmResource realmResource = keycloak.realm(realm);
            UserResource userResource = realmResource.users().get(keycloakUserId);

            // Fetch the role representation from the realm
            RoleRepresentation role = realmResource.roles().get(roleName).toRepresentation();
            if (role == null) {
                log.error("Role '{}' not found in Keycloak realm '{}'", roleName, realm);
                return;
            }

            // Assign the role to the user
            userResource.roles().realmLevel().add(Collections.singletonList(role));
            log.info("Successfully assigned role '{}' to user '{}'", roleName, keycloakUserId);

        } catch (Exception e) {
            log.error("Failed to assign role '{}' to user '{}' in Keycloak: {}", roleName, keycloakUserId, e.getMessage());
            throw new RuntimeException("Failed to update user roles in Keycloak", e);
        }
    }
}
