package com.retech.controller;

import com.retech.dto.TradeInDtos.CreateTradeInRequest;
import com.retech.model.TradeIn;
import com.retech.security.CurrentUser;
import com.retech.service.TradeInService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trade-ins")
@RequiredArgsConstructor
public class TradeInController {
    private final TradeInService tradeInService;

    @PostMapping
    public TradeIn create(@Valid @RequestBody CreateTradeInRequest req) {
        return tradeInService.create(req);
    }

    @GetMapping("/mine")
    public List<TradeIn> mine() {
        return tradeInService.mine(CurrentUser.id());
    }
}
