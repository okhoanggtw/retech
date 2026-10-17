package com.retech.security;

import com.retech.exception.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class CurrentUser {
    private CurrentUser() {}

    /** User hien tai hoac null neu chua dang nhap */
    public static AuthUser getOrNull() {
        Authentication a = SecurityContextHolder.getContext().getAuthentication();
        return a != null && a.getPrincipal() instanceof AuthUser u ? u : null;
    }

    public static AuthUser get() {
        AuthUser u = getOrNull();
        if (u == null) throw new ApiException(HttpStatus.UNAUTHORIZED, "Vui lòng đăng nhập");
        return u;
    }

    public static String id() {
        return get().id();
    }
}
