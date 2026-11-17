package com.retech.service;

import com.retech.dto.CartDtos.CartLine;
import com.retech.exception.ApiException;
import com.retech.model.Promotion;
import com.retech.model.User;
import com.retech.repository.PromotionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PromotionService {
    private final PromotionRepository repo;

    public Promotion validate(String code, long subtotal) {
        return validate(code, subtotal, null, null);
    }

    /** Kiem tra ma va tra ve promotion hop le, nem loi neu khong dung duoc */
    public Promotion validate(String code, long subtotal, List<CartLine> items, User user) {
        Promotion p = repo.findByCodeIgnoreCase(code.trim())
                .orElseThrow(() -> ApiException.badRequest("Mã giảm giá không tồn tại"));
        if (!p.isValidAt(Instant.now())) throw ApiException.badRequest("Mã giảm giá đã hết hạn hoặc hết lượt");

        // Kiem tra xac minh sinh vien
        if (p.isStudentOnly()) {
            if (user == null || !user.isStudentVerified()) {
                throw ApiException.badRequest("Mã \"" + p.getCode() + "\" chỉ dành cho sinh viên đã xác minh tài khoản.");
            }
        }

        // Kiem tra ap dung cho san pham / danh muc nhat dinh
        boolean hasRestrictions = (p.getApplicableProductIds() != null && !p.getApplicableProductIds().isEmpty())
                || (p.getApplicableCategories() != null && !p.getApplicableCategories().isEmpty());
        if (hasRestrictions && items != null && !items.isEmpty()) {
            boolean hasEligible = items.stream().anyMatch(l -> p.appliesToProduct(l.product()));
            if (!hasEligible) {
                throw ApiException.badRequest("Mã \"" + p.getCode() + "\" chỉ áp dụng cho một số sản phẩm/danh mục nhất định trong cửa hàng.");
            }
        }

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
