package com.retech.service;

import com.retech.dto.AiDtos.DeviceInfo;
import com.retech.dto.TradeInDtos.*;
import com.retech.exception.ApiException;
import com.retech.model.TradeIn;
import com.retech.repository.TradeInRepository;
import com.retech.security.AuthUser;
import com.retech.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TradeInService {
    private final TradeInRepository repo;
    private final PricingService pricingService;

    public TradeIn create(CreateTradeInRequest req) {
        DeviceInfo d = req.device();
        AuthUser u = CurrentUser.getOrNull();
        TradeIn t = TradeIn.builder()
                .userId(u != null ? u.id() : null)
                .category(d.category()).brand(d.brand()).model(d.model()).storage(d.storage())
                .purchaseYear(d.purchaseYear()).condition(d.condition()).batteryHealth(d.batteryHealth())
                .issues(d.issues() != null ? new ArrayList<>(d.issues()) : new ArrayList<>())
                .accessories(d.accessories() != null ? new ArrayList<>(d.accessories()) : new ArrayList<>())
                .referenceNewPrice(d.referenceNewPrice()).note(d.note())
                .images(req.images() != null ? new ArrayList<>(req.images()) : new ArrayList<>())
                .contactName(req.contactName()).contactPhone(req.contactPhone()).contactEmail(req.contactEmail())
                .aiEstimate(pricingService.estimate(d))
                .build();
        return repo.save(t);
    }

    public List<TradeIn> mine(String userId) {
        return repo.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<TradeIn> all() {
        return repo.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    public TradeIn update(String id, UpdateTradeInRequest req) {
        TradeIn t = repo.findById(id).orElseThrow(() -> ApiException.notFound("yêu cầu thu mua"));
        if (req.status() != null) t.setStatus(req.status());
        if (req.offerPrice() != null) t.setOfferPrice(req.offerPrice());
        if (req.adminNote() != null) t.setAdminNote(req.adminNote());
        return repo.save(t);
    }
}
