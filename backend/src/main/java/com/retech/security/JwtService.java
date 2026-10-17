package com.retech.security;

import com.retech.config.AppProperties;
import com.retech.model.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;

@Service
public class JwtService {
    private final SecretKey key;
    private final long expirationHours;

    public JwtService(AppProperties props) {
        this.key = Keys.hmacShaKeyFor(sha256(props.getJwt().getSecret()));
        this.expirationHours = props.getJwt().getExpirationHours();
    }

    private static byte[] sha256(String s) {
        try {
            return MessageDigest.getInstance("SHA-256").digest(s.getBytes(StandardCharsets.UTF_8));
        } catch (Exception e) {
            throw new IllegalStateException(e);
        }
    }

    public String generate(User user) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(user.getId())
                .claim("email", user.getEmail())
                .claim("role", user.getRole().name())
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(expirationHours, ChronoUnit.HOURS)))
                .signWith(key)
                .compact();
    }

    /** Tra ve null neu token sai/het han */
    public AuthUser parse(String token) {
        try {
            Claims c = Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
            return new AuthUser(c.getSubject(), c.get("email", String.class), c.get("role", String.class));
        } catch (Exception e) {
            return null;
        }
    }
}
