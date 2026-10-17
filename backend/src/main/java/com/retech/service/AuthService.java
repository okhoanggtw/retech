package com.retech.service;

import com.retech.dto.AuthDtos.*;
import com.retech.exception.ApiException;
import com.retech.model.Role;
import com.retech.model.User;
import com.retech.repository.UserRepository;
import com.retech.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepo;
    private final PasswordEncoder encoder;
    private final JwtService jwtService;

    public AuthResponse register(RegisterRequest req) {
        String email = req.email().trim().toLowerCase();
        if (userRepo.existsByEmailIgnoreCase(email))
            throw new ApiException(HttpStatus.CONFLICT, "Email đã được sử dụng");
        User u = User.builder()
                .fullName(req.fullName().trim())
                .email(email)
                .phone(req.phone())
                .passwordHash(encoder.encode(req.password()))
                .role(Role.USER)
                .build();
        u = userRepo.save(u);
        return new AuthResponse(jwtService.generate(u), u);
    }

    public AuthResponse login(LoginRequest req) {
        User u = userRepo.findByEmailIgnoreCase(req.email().trim())
                .orElseThrow(() -> new BadCredentialsException("bad"));
        if (!encoder.matches(req.password(), u.getPasswordHash())) throw new BadCredentialsException("bad");
        if (!u.isEnabled()) throw new ApiException(HttpStatus.FORBIDDEN, "Tài khoản đã bị khóa");
        return new AuthResponse(jwtService.generate(u), u);
    }

    public User me(String userId) {
        return userRepo.findById(userId).orElseThrow(() -> ApiException.notFound("tài khoản"));
    }

    public User updateProfile(String userId, UpdateProfileRequest req) {
        User u = me(userId);
        if (req.fullName() != null && !req.fullName().isBlank()) u.setFullName(req.fullName().trim());
        if (req.phone() != null) u.setPhone(req.phone());
        if (req.address() != null) u.setAddress(req.address());
        if (req.avatar() != null) u.setAvatar(req.avatar());
        return userRepo.save(u);
    }

    public void changePassword(String userId, ChangePasswordRequest req) {
        User u = me(userId);
        if (!encoder.matches(req.currentPassword(), u.getPasswordHash()))
            throw ApiException.badRequest("Mật khẩu hiện tại không đúng");
        u.setPasswordHash(encoder.encode(req.newPassword()));
        userRepo.save(u);
    }
}
