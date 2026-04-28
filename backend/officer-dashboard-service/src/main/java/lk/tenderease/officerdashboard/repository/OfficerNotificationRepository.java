package lk.tenderease.officerdashboard.repository;

import lk.tenderease.officerdashboard.entity.OfficerNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface OfficerNotificationRepository extends JpaRepository<OfficerNotification, UUID> {

    @Query("""
            select n from OfficerNotification n
            where (:recipientUserId is null or n.recipientUserId = :recipientUserId)
               or (:recipient is null or n.recipient = :recipient)
            order by n.createdAt desc
            """)
    List<OfficerNotification> findForRecipient(
            @Param("recipientUserId") String recipientUserId,
            @Param("recipient") String recipient
    );

    @Query("""
            select count(n) from OfficerNotification n
            where ((:recipientUserId is null or n.recipientUserId = :recipientUserId)
               or (:recipient is null or n.recipient = :recipient))
              and n.read = false
            """)
    long countUnreadForRecipient(
            @Param("recipientUserId") String recipientUserId,
            @Param("recipient") String recipient
    );

    @Query("""
            select count(n) from OfficerNotification n
            where ((:recipientUserId is null or n.recipientUserId = :recipientUserId)
               or (:recipient is null or n.recipient = :recipient))
              and lower(n.status) = lower(:status)
            """)
    long countByStatusForRecipient(
            @Param("recipientUserId") String recipientUserId,
            @Param("recipient") String recipient,
            @Param("status") String status
    );
}
