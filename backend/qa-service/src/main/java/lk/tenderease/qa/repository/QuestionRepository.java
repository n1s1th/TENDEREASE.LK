package lk.tenderease.qa.repository;

import lk.tenderease.qa.domain.Question;
import lk.tenderease.qa.domain.QuestionCategory;
import lk.tenderease.qa.domain.QuestionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface QuestionRepository extends JpaRepository<Question, Long> {

    @EntityGraph(attributePaths = "answer")
    Page<Question> findByCategory(QuestionCategory category, Pageable pageable);

    @EntityGraph(attributePaths = "answer")
    Page<Question> findByUserId(String userId, Pageable pageable);

    @EntityGraph(attributePaths = "answer")
    Page<Question> findAll(Pageable pageable);

    @EntityGraph(attributePaths = "answer")
    Page<Question> findByStatus(QuestionStatus status, Pageable pageable);

    @EntityGraph(attributePaths = "answer")
    Optional<Question> findWithAnswerById(Long id);
}
