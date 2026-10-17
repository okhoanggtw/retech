package com.retech.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.retech.config.AppProperties;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.*;

/** Goi Google Gemini API (generateContent) va ep tra ve JSON */
@Slf4j
@Component
public class GeminiClient {
    private final AppProperties.Gemini cfg;
    private final ObjectMapper mapper;
    private final RestClient http;

    public record Msg(String role, String text) {}

    public GeminiClient(AppProperties props, ObjectMapper mapper) {
        this.cfg = props.getGemini();
        this.mapper = mapper;
        SimpleClientHttpRequestFactory rf = new SimpleClientHttpRequestFactory();
        rf.setConnectTimeout(10_000);
        rf.setReadTimeout(60_000);
        this.http = RestClient.builder().baseUrl(cfg.getBaseUrl()).requestFactory(rf).build();
    }

    public boolean enabled() {
        return cfg.enabled();
    }

    /**
     * @param system   huong dan he thong
     * @param messages lich su hoi thoai (role: user | model)
     * @return JSON do model tra ve, hoac null neu loi
     */
    public JsonNode generateJson(String system, List<Msg> messages, double temperature) {
        if (!enabled()) return null;
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("systemInstruction", Map.of("parts", List.of(Map.of("text", system))));
        List<Map<String, Object>> contents = new ArrayList<>();
        for (Msg m : messages) {
            contents.add(Map.of("role", "model".equals(m.role()) || "assistant".equals(m.role()) ? "model" : "user",
                    "parts", List.of(Map.of("text", m.text()))));
        }
        body.put("contents", contents);
        body.put("generationConfig", Map.of(
                "temperature", temperature,
                "responseMimeType", "application/json"));
        // Thu lan luot cac model (model chinh co the qua tai 503 / bi ngung 404)
        for (String model : cfg.getModel().split(",")) {
            model = model.trim();
            if (model.isEmpty()) continue;
            for (int attempt = 1; attempt <= 2; attempt++) {
                try {
                    JsonNode res = http.post()
                            .uri("/models/{model}:generateContent", model)
                            .header("x-goog-api-key", cfg.getApiKey())
                            .contentType(MediaType.APPLICATION_JSON)
                            .body(body)
                            .retrieve()
                            .body(JsonNode.class);
                    String text = extractText(res);
                    if (text == null) break;
                    return mapper.readTree(stripFences(text));
                } catch (org.springframework.web.client.HttpStatusCodeException e) {
                    int code = e.getStatusCode().value();
                    String msg = e.getResponseBodyAsString().replaceAll("\\s+", " ");
                    log.warn("Gemini {} loi {} (lan {}): {}", model, code, attempt, msg.substring(0, Math.min(200, msg.length())));
                    if (code == 503 || code == 429 || code == 500) {
                        sleep(800L * attempt);
                        continue;      // thu lai / sang model sau
                    }
                    if (code == 404) break; // model khong ton tai -> model sau
                    return null;            // 400/401/403: loi key hoac request
                } catch (Exception e) {
                    log.warn("Goi Gemini {} that bai: {}", model, e.getMessage());
                    break;
                }
            }
        }
        return null;
    }

    private static void sleep(long ms) {
        try { Thread.sleep(ms); } catch (InterruptedException ignored) { Thread.currentThread().interrupt(); }
    }

    private String extractText(JsonNode res) {
        if (res == null) return null;
        JsonNode parts = res.path("candidates").path(0).path("content").path("parts");
        if (!parts.isArray()) return null;
        StringBuilder sb = new StringBuilder();
        for (JsonNode p : parts) {
            if (p.path("thought").asBoolean(false)) continue;
            sb.append(p.path("text").asText(""));
        }
        return sb.isEmpty() ? null : sb.toString();
    }

    private String stripFences(String s) {
        String t = s.trim();
        if (t.startsWith("```")) {
            t = t.replaceFirst("^```(json)?", "");
            int end = t.lastIndexOf("```");
            if (end >= 0) t = t.substring(0, end);
        }
        return t.trim();
    }
}
