package lk.tenderease.bid.repository;

import lk.tenderease.bid.entity.Bid;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BidRepository extends JpaRepository<Bid, UUID> {

    List<Bid> findByTenderId(UUID tenderId);

    long countByTenderId(UUID tenderId);

    List<Bid> findByBidderEmail(String bidderEmail);

    List<Bid> findByStatus(String status);
}
