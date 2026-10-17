package com.retech.controller.admin;

import com.retech.exception.ApiException;
import com.retech.model.Role;
import com.retech.model.User;
import com.retech.repository.UserRepository;
import com.retech.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {
    private final UserRepository userRepo;

    @GetMapping
    public List<User> list() {
        return userRepo.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    public record UpdateUserRequest(Role role, Boolean enabled) {}

    @PutMapping("/{id}")
    public User update(@PathVariable String id, @RequestBody UpdateUserRequest req) {
        User u = userRepo.findById(id).orElseThrow(() -> ApiException.notFound("tài khoản"));
        if (u.getId().equals(CurrentUser.id())) throw ApiException.badRequest("Không thể tự sửa quyền/khóa chính mình");
        if (req.role() != null) u.setRole(req.role());
        if (req.enabled() != null) u.setEnabled(req.enabled());
        return userRepo.save(u);
    }

    @DeleteMapping("/{id}")
    public Map<String, String> delete(@PathVariable String id) {
        if (id.equals(CurrentUser.id())) throw ApiException.badRequest("Không thể xóa chính mình");
        userRepo.deleteById(id);
        return Map.of("message", "Đã xóa tài khoản");
    }
}
