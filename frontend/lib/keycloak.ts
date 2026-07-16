import Keycloak from 'keycloak-js';

// Configuration for Keycloak
const keycloakConfig = {
  url: process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'http://localhost:8080',
  realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM || 'tenderease',
  clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || 'tenderease-frontend',
};

// Create a singleton instance
const keycloak = typeof window !== 'undefined' ? new Keycloak(keycloakConfig) : null;

export const login = () => {
  if (keycloak) {
    keycloak.login({ redirectUri: window.location.origin });
  }
};

export const signup = () => {
  if (keycloak) {
    keycloak.register({ redirectUri: window.location.origin });
  }
};

export const logout = () => {
  if (keycloak) {
    keycloak.logout({ redirectUri: window.location.origin });
  }
};

export default keycloak;
