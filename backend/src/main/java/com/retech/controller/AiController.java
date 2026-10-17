package com.retech.controller;

import com.retech.dto.AiDtos.*;
import com.retech.model.AiPriceSuggestion;
import com.retech.service.ChatbotService;
import com.retech.service.GeminiClient;
import com.retech.service.PricingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {
    private final ChatbotService chatbotService;
    private final PricingService pricingService;
    private final GeminiClient gemini;

    @PostMapping("/chat")
    public ChatResponse chat(@Valid @RequestBody ChatRequest req) {
        return chatbotService.chat(req);
    }

    /** Dinh gia nhanh (chua gui yeu cau thu mua) */
    @PostMapping("/price-estimate")
    public AiPriceSuggestion estimate(@Valid @RequestBody DeviceInfo device) {
        return pricingService.estimate(device);
    }

    @GetMapping("/status")
    public Map<String, Object> status() {
        return Map.of("geminiEnabled", gemini.enabled());
    }
}
