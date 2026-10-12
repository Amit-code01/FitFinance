package com.fitfinance.security;
import org.junit.jupiter.api.Test;import static org.junit.jupiter.api.Assertions.*;
class JwtServiceTest {@Test void tokenRoundTripUsesAuthenticatedUserId(){JwtService service=new JwtService("a-secure-test-secret-that-is-at-least-32-bytes",60000);String token=service.create(42L);assertEquals(42L,service.userId(token));}}
