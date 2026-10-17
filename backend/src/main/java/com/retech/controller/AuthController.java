package com.retech.controller;

import com.retech.dto.AuthDtos.*;
import com.retech.model.User;
import com.retech.security.CurrentUser;
import com.retech.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody RegisterRequest req) {
        return authService.register(req);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest req) {
        return authService.login(req);
    }

    @GetMapping("/me")
    public User me() {
        return authService.me(CurrentUser.id());
    }

    @PutMapping("/me")
    public User update(@RequestBody UpdateProfileRequest req) {
        return authService.updateProfile(CurrentUser.id(), req);
    }

    @PutMapping("/password")
    public Map<String, String> changePassword(@Valid @RequestBody ChangePasswordRequest req) {
        authService.changePassword(CurrentUser.id(), req);
        return Map.of("message", "Đổi mật khẩu thành công");
    }
}
