package com.retech.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.retech.config.AppProperties;
import com.retech.model.Order;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.*;

/**
 * Tich hop cong thanh toan PayOS (VietQR) - goi REST API truc tiep.
 * Tai lieu: https://payos.vn/docs/api/
 * Neu chua cau hinh key -> chay che do DEMO (gia lap thanh toan) de nhom test.
 */
@Slf4j
@Service
public class PayOSService {
    private final AppProperties.PayOS cfg;
    private final String frontendUrl;
    private final ObjectMapper mapper;
    private final RestClient http;

    public record PaymentLink(String paymentLinkId, String checkoutUrl, String qrCode) {}

    public record PaymentInfo(String status, long amount, long amountPaid, String reference) {}

    public PayOSService(AppProperties props, ObjectMapper mapper) {
        this.cfg = props.getPayos();
        this.frontendUrl = props.getFrontendUrl();
        this.mapper = mapper;
        this.http = RestClient.builder()
                .baseUrl(cfg.getBaseUrl())
                .defaultHeader("x-client-id", Objects.toString(cfg.getClientId(), ""))
                .defaultHeader("x-api-key", Objects.toString(cfg.getApiKey(), ""))
                .build();
    }

    public boolean isDemoMode() {
        return !cfg.enabled();
    }

    public PaymentLink createPaymentLink(Order order) throws Exception {
        String returnUrl = frontendUrl + "/checkout/result?orderCode=" + order.getOrderCode();
        String cancelUrl = frontendUrl + "/checkout/result?cancel=true&orderCode=" + order.getOrderCode();

        if (isDemoMode()) {
            log.warn("PayOS chua cau hinh -> tao link DEMO cho don {}", order.getOrderCode());
            return new PaymentLink("DEMO-" + order.getOrderCode(),
                    frontendUrl + "/checkout/demo-pay?orderCode=" + order.getOrderCode(), null);
        }

        String code = String.valueOf(order.getOrderCode());
        String description = "RT" + code.substring(Math.max(0, code.length() - 7)); // <= 9 ky tu
        long amount = order.getTotal();

        String dataToSign = "amount=" + amount + "&cancelUrl=" + cancelUrl + "&description=" + description
                + "&orderCode=" + order.getOrderCode() + "&returnUrl=" + returnUrl;

        List<Map<String, Object>> items = new ArrayList<>();
        for (Order.Item it : order.getItems()) {
            String name = it.getName().length() > 50 ? it.getName().substring(0, 50) : it.getName();
            items.add(Map.of("name", name, "quantity", it.getQuantity(), "price", it.getPrice()));
        }

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("orderCode", order.getOrderCode());
        body.put("amount", amount);
        body.put("description", description);
        body.put("buyerName", order.getShipping().getFullName());
        body.put("buyerPhone", order.getShipping().getPhone());
        if (order.getShipping().getEmail() != null && !order.getShipping().getEmail().isBlank())
            body.put("buyerEmail", order.getShipping().getEmail());
        body.put("items", items);
        body.put("cancelUrl", cancelUrl);
        body.put("returnUrl", returnUrl);
        body.put("expiredAt", Instant.now().getEpochSecond() + 15 * 60);
        body.put("signature", hmac(dataToSign));

        JsonNode res = http.post().uri("/v2/payment-requests")
                .contentType(MediaType.APPLICATION_JSON).body(body)
                .retrieve().body(JsonNode.class);
        if (res == null || !"00".equals(res.path("code").asText()))
            throw new IllegalStateException("PayOS loi: " + (res == null ? "null" : res.path("desc").asText()));
        JsonNode d = res.path("data");
        return new PaymentLink(d.path("paymentLinkId").asText(), d.path("checkoutUrl").asText(), d.path("qrCode").asText());
    }

    public PaymentInfo getPaymentInfo(long orderCode) {
        if (isDemoMode()) return null;
        try {
            JsonNode res = http.get().uri("/v2/payment-requests/{id}", orderCode).retrieve().body(JsonNode.class);
            if (res == null || !"00".equals(res.path("code").asText())) return null;
            JsonNode d = res.path("data");
            String ref = null;
            JsonNode tx = d.path("transactions");
            if (tx.isArray() && !tx.isEmpty()) ref = tx.get(0).path("reference").asText(null);
            return new PaymentInfo(d.path("status").asText(), d.path("amount").asLong(), d.path("amountPaid").asLong(), ref);
        } catch (Exception e) {
            log.warn("Khong lay duoc trang thai PayOS cho don {}: {}", orderCode, e.getMessage());
            return null;
        }
    }

    public void cancelQuietly(long orderCode, String reason) {
        if (isDemoMode()) return;
        try {
            http.post().uri("/v2/payment-requests/{id}/cancel", orderCode)
                    .contentType(MediaType.APPLICATION_JSON).body(Map.of("cancellationReason", reason))
                    .retrieve().toBodilessEntity();
        } catch (Exception e) {
            log.warn("Huy link PayOS {} that bai: {}", orderCode, e.getMessage());
        }
    }

    /** Dang ky URL webhook voi PayOS (PayOS se goi thu URL nay) */
    public JsonNode confirmWebhook(String webhookUrl) {
        return http.post().uri("/confirm-webhook").contentType(MediaType.APPLICATION_JSON)
                .body(Map.of("webhookUrl", webhookUrl)).retrieve().body(JsonNode.class);
    }

    /**
     * Xac thuc chu ky webhook: sap xep cac truong trong "data" theo alphabet,
     * noi thanh key1=value1&key2=value2..., HMAC_SHA256 voi checksum key.
     */
    public boolean verifyWebhook(JsonNode payload) {
        if (isDemoMode()) return false;
        JsonNode data = payload.path("data");
        String signature = payload.path("signature").asText("");
        TreeMap<String, String> sorted = new TreeMap<>();
        data.fieldNames().forEachRemaining(k -> {
            JsonNode v = data.get(k);
            String s;
            if (v == null || v.isNull()) s = "";
            else if (v.isTextual()) s = v.asText();
            else s = v.toString();
            if ("null".equals(s) || "undefined".equals(s)) s = "";
            sorted.put(k, s);
        });
        StringBuilder sb = new StringBuilder();
        sorted.forEach((k, v) -> {
            if (!sb.isEmpty()) sb.append('&');
            sb.append(k).append('=').append(v);
        });
        return hmac(sb.toString()).equalsIgnoreCase(signature);
    }

    private String hmac(String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(cfg.getChecksumKey().getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return HexFormat.of().formatHex(mac.doFinal(data.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new IllegalStateException(e);
        }
    }
}
