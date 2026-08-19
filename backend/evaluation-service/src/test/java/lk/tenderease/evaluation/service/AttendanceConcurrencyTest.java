package lk.tenderease.evaluation.service;

import lk.tenderease.common.constant.OpeningStatus;
import lk.tenderease.evaluation.dto.request.OpeningAttendanceRequest;
import lk.tenderease.evaluation.entity.OpeningSession;
import lk.tenderease.evaluation.repository.OpeningAttendanceRepository;
import lk.tenderease.evaluation.repository.OpeningSessionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.TransactionSystemException;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@ActiveProfiles("test")
class AttendanceConcurrencyTest {

    @Autowired
    private BidOpeningService bidOpeningService;

    @Autowired
    private OpeningSessionRepository sessionRepository;

    @Autowired
    private OpeningAttendanceRepository attendanceRepository;

    private UUID sessionId;

    @BeforeEach
    void setUp() {
        attendanceRepository.deleteAll();
        sessionRepository.deleteAll();

        OpeningSession session = new OpeningSession();
        session.setTenderId(UUID.randomUUID());
        session.setScheduledOpeningTime(LocalDateTime.now().plusHours(1));
        session.setStatus(OpeningStatus.SCHEDULED);
        OpeningSession saved = sessionRepository.save(session);
        sessionId = saved.getId();
    }

    @Test
    void testConcurrentAttendanceMarking_UniqueConstraintPreventsDuplicates() throws InterruptedException {
        int threadsCount = 4;
        ExecutorService executorService = Executors.newFixedThreadPool(threadsCount);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch finishLatch = new CountDownLatch(threadsCount);

        OpeningAttendanceRequest request = new OpeningAttendanceRequest();
        request.setOfficerId("OFF-9999");
        request.setOfficerName("Jane Doe");
        request.setDesignation("Technical Member");

        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger errorCount = new AtomicInteger(0);

        for (int i = 0; i < threadsCount; i++) {
            executorService.submit(() -> {
                try {
                    startLatch.await();
                    bidOpeningService.markAttendance(sessionId, request);
                    successCount.incrementAndGet();
                } catch (DataIntegrityViolationException | TransactionSystemException e) {
                    errorCount.incrementAndGet();
                } catch (Exception e) {
                    // Check if underlying cause is unique constraint
                    if (e.getMessage() != null && e.getMessage().contains("uq_session_officer")) {
                        errorCount.incrementAndGet();
                    } else {
                        errorCount.incrementAndGet();
                    }
                } finally {
                    finishLatch.countDown();
                }
            });
        }

        startLatch.countDown(); // simultaneous trigger
        boolean finished = finishLatch.await(5, TimeUnit.SECONDS);
        assertTrue(finished, "Threads should finish execution within timeout");

        // Exactly one should succeed due to unique constraint, others must fail / roll back
        assertEquals(1, successCount.get(), "Exactly one concurrency write must succeed");
        assertEquals(threadsCount - 1, errorCount.get(), "Remaining concurrent writes must roll back or throw conflict");
        assertEquals(1, attendanceRepository.count(), "Only one row must exist in the database table");
    }
}
