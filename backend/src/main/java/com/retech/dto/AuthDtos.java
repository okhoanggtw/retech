package com.retech.dto;

import com.retech.model.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public final class AuthDtos {
    private AuthDtos() {}

    public record RegisterRequest(
            @NotBlank(message = "Vui lòng nhập họ tên") String fullName,
            @NotBlank(message = "Vui lòng nhập email") @Email(message = "Email không hợp lệ") String email,
            @NotBlank @Size(min = 6, message = "Mật khẩu tối thiểu 6 ký tự") String password,
            String phone) {}

    public record LoginRequest(
            @NotBlank @Email String email,
            @NotBlank String password) {}

    public record AuthResponse(String token, User user) {}

    public record UpdateProfileRequest(String fullName, String phone, String address, String avatar) {}

    public record ChangePasswordRequest(
            @NotBlank String currentPassword,
            @NotBlank @Size(min = 6, message = "Mật khẩu tối thiểu 6 ký tự") String newPassword) {}
}
