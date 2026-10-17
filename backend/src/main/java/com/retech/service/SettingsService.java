package com.retech.service;

import com.retech.model.SiteSettings;
import com.retech.repository.SiteSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SettingsService {
    public static final String MAIN_ID = "main";
    private final SiteSettingsRepository repo;

    public SiteSettings get() {
        return repo.findById(MAIN_ID).orElseGet(() -> SiteSettings.builder()
                .id(MAIN_ID).storeName("ReTech").shippingFee(30000).freeShipThreshold(2000000).build());
    }

    public SiteSettings save(SiteSettings s) {
        s.setId(MAIN_ID);
        return repo.save(s);
    }

    public long shippingFeeFor(long subtotal) {
        SiteSettings s = get();
        return subtotal >= s.getFreeShipThreshold() ? 0 : s.getShippingFee();
    }
}
