package com.training.demobank.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.training.demobank.model.Customer;
import com.training.demobank.service.BankingService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.time.LocalDate;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = AuthController.class)
@AutoConfigureMockMvc
class AuthControllerTest {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    ObjectMapper mapper;

    @MockBean
    BankingService bankingService;

    @MockBean
    BCryptPasswordEncoder passwordEncoder; // new mock bean for constructor injection

    @Test
    void register_createsCustomer() throws Exception {
        Customer c = new Customer();
        c.setId(42L);
        c.setFirstName("Reg");
        c.setLastName("User");
        c.setEmail("reg@example.com");
        c.setDob(LocalDate.of(1991,2,3));
        c.setCreatedAt(Instant.parse("2024-01-01T00:00:00Z"));

        Mockito.when(bankingService.createCustomer(any())).thenReturn(c);

        String json = "{" +
                "\"firstName\":\"Reg\"," +
                "\"lastName\":\"User\"," +
                "\"email\":\"reg@example.com\"," +
                "\"phone\":\"999\"," +
                "\"dob\":\"1991-02-03\"}";

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.user.id", is(42)))
                .andExpect(jsonPath("$.token", containsString("demo-token-42")));
    }

    @Test
    void login_success() throws Exception {
        Customer c = new Customer();
        c.setId(99L);
        c.setFirstName("Login");
        c.setEmail("login@example.com");
        c.setDob(LocalDate.of(1990,1,1));
        c.setCreatedAt(Instant.parse("2024-01-01T00:00:00Z"));
        c.setPasswordHash("stored-hash");

        Mockito.when(bankingService.getCustomerByEmail("login@example.com")).thenReturn(c);
        Mockito.when(passwordEncoder.matches(eq("ignored"), eq("stored-hash"))).thenReturn(true);

        String json = "{\"email\":\"login@example.com\",\"password\":\"ignored\"}";

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.user.id", is(99)))
                .andExpect(jsonPath("$.token", containsString("demo-token-99")));
    }

    @Test
    void login_wrongPassword_returnsFailure() throws Exception {
        Customer c = new Customer();
        c.setId(77L);
        c.setFirstName("WrongPass");
        c.setEmail("wp@example.com");
        c.setDob(LocalDate.of(1985,5,5));
        c.setCreatedAt(Instant.parse("2024-01-01T00:00:00Z"));
        c.setPasswordHash("stored-hash");

        Mockito.when(bankingService.getCustomerByEmail("wp@example.com")).thenReturn(c);
        Mockito.when(passwordEncoder.matches(eq("bad"), eq("stored-hash"))).thenReturn(false);

        String json = "{\"email\":\"wp@example.com\",\"password\":\"bad\"}";

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", containsString("Invalid credentials")));
    }

    @Test
    void login_invalid_returnsFailure() throws Exception {
        Mockito.when(bankingService.getCustomerByEmail("missing@example.com"))
                .thenThrow(new IllegalArgumentException("not found"));

        String json = "{\"email\":\"missing@example.com\",\"password\":\"x\"}";

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", containsString("Invalid credentials")));
    }
}
