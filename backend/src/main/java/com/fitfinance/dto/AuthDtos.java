package com.fitfinance.dto;
import jakarta.validation.constraints.*;
public final class AuthDtos {private AuthDtos(){} public record RegisterRequest(@NotBlank @Size(max=80)String name,@NotBlank @Email @Size(max=160)String email,@NotBlank @Size(min=8,max=100)String password){} public record LoginRequest(@NotBlank @Email String email,@NotBlank String password){} public record AuthResponse(String token,Long userId,String name,String email){} }
