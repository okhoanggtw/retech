package com.retech.controller;

import com.retech.service.FileService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.concurrent.TimeUnit;

@RestController
@RequiredArgsConstructor
public class FileController {
    private final FileService fileService;

    @GetMapping("/api/files/{id}")
    public ResponseEntity<Resource> get(@PathVariable String id) throws IOException {
        var res = fileService.load(id);
        String type = res.getContentType() != null ? res.getContentType() : MediaType.APPLICATION_OCTET_STREAM_VALUE;
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(type))
                .cacheControl(CacheControl.maxAge(30, TimeUnit.DAYS).cachePublic())
                .body(res);
    }
}
