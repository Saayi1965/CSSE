package com.csse.smartwaste.config;

import com.mongodb.MongoSocketOpenException;
import com.mongodb.MongoTimeoutException;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.Map;

@ControllerAdvice
public class RestExceptionHandler {

    @ExceptionHandler({DataAccessResourceFailureException.class, MongoTimeoutException.class, MongoSocketOpenException.class})
    public ResponseEntity<Map<String, Object>> handleDbUnavailable(Exception ex) {
        String msg = "Database unavailable: " + ex.getClass().getSimpleName() + ". " + ex.getMessage();
        Map<String, Object> body = Map.of(
                "error", "service_unavailable",
                "message", "MongoDB is not reachable. Please start MongoDB or update configuration.",
                "detail", msg
        );
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(body);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleAll(Exception ex) {
        Map<String, Object> body = Map.of(
                "error", "internal_error",
                "message", ex.getMessage() == null ? "Unexpected server error" : ex.getMessage()
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }
}
