package com.fitfinance.exception;
import org.springframework.http.*;import org.springframework.web.bind.MethodArgumentNotValidException;import org.springframework.web.bind.annotation.*;import org.springframework.web.server.ResponseStatusException;import java.time.Instant;import java.util.*;
@RestControllerAdvice public class ApiExceptionHandler {
 @ExceptionHandler(MethodArgumentNotValidException.class) ResponseEntity<Map<String,Object>> validation(MethodArgumentNotValidException ex){String message=ex.getBindingResult().getFieldErrors().stream().map(e->e.getField()+" "+Objects.requireNonNullElse(e.getDefaultMessage(),"is invalid")).findFirst().orElse("Invalid request");return response(HttpStatus.BAD_REQUEST,message);}
 @ExceptionHandler(ResponseStatusException.class) ResponseEntity<Map<String,Object>> status(ResponseStatusException ex){return response(HttpStatus.valueOf(ex.getStatusCode().value()),ex.getReason()==null?"Request failed":ex.getReason());}
 @ExceptionHandler(Exception.class) ResponseEntity<Map<String,Object>> unexpected(Exception ex){return response(HttpStatus.INTERNAL_SERVER_ERROR,"Unexpected server error");}
 private ResponseEntity<Map<String,Object>> response(HttpStatus status,String message){return ResponseEntity.status(status).body(Map.of("timestamp",Instant.now().toString(),"status",status.value(),"message",message));}
}
