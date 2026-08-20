package lk.tenderease.qa.service;

import lk.tenderease.qa.exception.UnauthorizedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class CurrentUser {

    public String userId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getName() == null) {
            throw new UnauthorizedException("Authenticated user is required");
        }
        return authentication.getName();
    }

    /**
     * Returns the authenticated user's ID, or "anonymous" if no user is logged in.
     * Used for endpoints that allow unauthenticated access (e.g., public question submission).
     */
    public String userIdOrAnonymous() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || authentication.getName() == null
                || "anonymousUser".equals(authentication.getName())) {
            return "anonymous";
        }
        return authentication.getName();
    }
}
