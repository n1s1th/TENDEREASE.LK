package lk.tenderease.bid.service;

import lk.tenderease.bid.dto.BidResponse;
import lk.tenderease.bid.entity.Bid;
import lk.tenderease.bid.repository.BidRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BidService {

    private final BidRepository bidRepository;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd MMM yyyy HH:mm");

    /**
     * Returns the total count of all bids in the system.
     * Used by the Officer Dashboard KPI cards.
     */
    public long getTotalBidCount() {
        long count = bidRepository.count();
        log.info("Total bid count: {}", count);
        return count;
    }

    /**
     * Returns the number of bids for a specific tender.
     */
    public long getBidCountByTender(UUID tenderId) {
        return bidRepository.countByTenderId(tenderId);
    }

    /**
     * Returns all bids for a specific tender.
     */
    public List<BidResponse> getBidsByTender(UUID tenderId) {
        return bidRepository.findByTenderId(tenderId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Returns all bids in the system.
     */
    public List<BidResponse> getAllBids() {
        return bidRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private BidResponse mapToResponse(Bid bid) {
        return BidResponse.builder()
                .id(bid.getId().toString())
                .tenderId(bid.getTenderId().toString())
                .bidderName(bid.getBidderName())
                .bidderEmail(bid.getBidderEmail())
                .companyName(bid.getCompanyName())
                .bidAmount(bid.getBidAmount())
                .currency(bid.getCurrency())
                .status(bid.getStatus())
                .submittedAt(bid.getSubmittedAt() != null ? bid.getSubmittedAt().format(DATE_FMT) : null)
                .build();
    }
}
