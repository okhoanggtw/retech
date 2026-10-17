package com.retech.security;

/** Thong tin user dang dang nhap (lay tu JWT) */
public record AuthUser(String id, String email, String role) {
    public boolean isAdmin() {
        return "ADMIN".equals(role);
    }
}
