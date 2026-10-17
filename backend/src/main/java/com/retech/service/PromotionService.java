package com.retech.service;

import com.retech.exception.ApiException;
import com.retech.model.Promotion;
import com.retech.repository.PromotionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PromotionService {
    private final PromotionRepository repo;

    /** Kiem tra ma va tra ve promotion hop le, nem loi neu khong dung duoc */
    public Promotion validate(String code, long subtotal) {
        Promotion p = repo.findByCodeIgnoreCase(code.trim())
                .orElseThrow(() -> ApiException.badRequest("Mã giảm giá không tồn tại"));
        if (!p.isValidAt(Instant.now())) throw ApiException.badRequest("Mã giảm giá đã hết hạn hoặc hết lượt");
        if (subtotal < p.getMinOrderValue())
            throw ApiException.badRequest("Đơn hàng tối thiểu " + com.retech.util.TextUtil.formatVnd(p.getMinOrderValue()) + " để dùng mã này");
        return p;
    }

    public Optional<Promotion> find(String code) {
        return code == null || code.isBlank() ? Optional.empty() : repo.findByCodeIgnoreCase(code.trim());
    }

    public void markUsed(Promotion p) {
        p.setUsedCount(p.getUsedCount() + 1);
        repo.save(p);
    }
}
