package com.retech.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class ApiException extends RuntimeException {
    private final HttpStatus status;

    public ApiException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }

    public static ApiException notFound(String what) {
        return new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy " + what);
    }

    public static ApiException badRequest(String msg) {
        return new ApiException(HttpStatus.BAD_REQUEST, msg);
    }
}
