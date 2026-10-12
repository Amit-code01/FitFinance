package com.fitfinance.controller;

import com.fitfinance.dto.AuthDtos.AuthResponse;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;

import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(
        webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
        properties = {
                "spring.datasource.url=jdbc:h2:mem:fitfinance-test;MODE=MySQL;DB_CLOSE_DELAY=-1",
                "spring.datasource.driver-class-name=org.h2.Driver",
                "spring.jpa.hibernate.ddl-auto=create-drop",
                "app.jwt.secret=fitfinance-integration-test-secret-key-32-bytes-minimum"
        }
)
class GuestAuthenticationIntegrationTest {
    @Autowired
    private TestRestTemplate http;

    @Autowired
    private Environment environment;

    @Test
    void rootEnvFileProvidesTheLocalJwtSecret() {
        assertThat(environment.getProperty("JWT_SECRET")).hasSizeGreaterThanOrEqualTo(32);
    }

    @Test
    void guestCanObtainTokenAndAccessProtectedApi() {
        var guestResponse = http.postForEntity("/api/auth/guest", null, AuthResponse.class);

        assertThat(guestResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(guestResponse.getBody()).isNotNull();
        assertThat(guestResponse.getBody().token()).isNotBlank();
        assertThat(guestResponse.getBody().name()).isEqualTo("Guest");

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(guestResponse.getBody().token());
        var expensesResponse = http.exchange(
                "/api/expenses", HttpMethod.GET, new HttpEntity<>(headers), String.class);

        assertThat(expensesResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(expensesResponse.getBody()).isEqualTo("[]");

        var dashboardResponse = http.exchange(
                "/api/dashboard", HttpMethod.GET, new HttpEntity<>(headers), String.class);
        assertThat(dashboardResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(dashboardResponse.getBody()).contains("monthlySpending", "budgetUsedPercentage");

        var budgetResponse = http.exchange(
                "/api/budget?month=10&year=2026", HttpMethod.GET,
                new HttpEntity<>(headers), String.class);
        assertThat(budgetResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    void protectedApiRejectsRequestsWithoutToken() {
        var response = http.getForEntity("/api/expenses", String.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    void expenseOwnershipIsScopedToAuthenticatedUserAndInvalidAmountsAreRejected() {
        AuthResponse owner = register("Owner");
        AuthResponse otherUser = register("Other");
        HttpHeaders ownerHeaders = bearer(owner.token());

        var create = http.exchange(
                "/api/expenses",
                HttpMethod.POST,
                new HttpEntity<>(Map.of(
                        "title", "Gym membership",
                        "amount", 40.0,
                        "category", "GYM",
                        "date", "2026-10-11"), ownerHeaders),
                String.class);
        assertThat(create.getStatusCode()).isEqualTo(HttpStatus.OK);

        var invalid = http.exchange(
                "/api/expenses",
                HttpMethod.POST,
                new HttpEntity<>(Map.of(
                        "title", "Invalid expense",
                        "amount", -1.0,
                        "category", "GYM",
                        "date", "2026-10-11"), ownerHeaders),
                String.class);
        assertThat(invalid.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);

        var otherUsersExpenses = http.exchange(
                "/api/expenses", HttpMethod.GET,
                new HttpEntity<>(bearer(otherUser.token())), String.class);
        assertThat(otherUsersExpenses.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(otherUsersExpenses.getBody()).isEqualTo("[]");
    }

    private AuthResponse register(String name) {
        String email = name.toLowerCase() + "-" + UUID.randomUUID() + "@example.test";
        return http.postForObject("/api/auth/register",
                Map.of("name", name, "email", email, "password", "test-password-123"),
                AuthResponse.class);
    }

    private HttpHeaders bearer(String token) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        return headers;
    }
}
