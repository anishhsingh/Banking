package com.training.demobank.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.training.demobank.dto.CustomerDtos;
import com.training.demobank.model.Customer;
import com.training.demobank.service.BankingService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.time.LocalDate;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = CustomerController.class)
@AutoConfigureMockMvc
class CustomerControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private BankingService bankingService;

    @Test
    void createCustomer_returnsCreated() throws Exception {
        CustomerDtos.CreateCustomerRequest req = new CustomerDtos.CreateCustomerRequest();
        req.firstName = "Alice";
        req.lastName = "Doe";
        req.email = "alice@example.com";
        req.phone = "1234567890";
        req.dob = LocalDate.of(1990, 1, 1);

        Customer saved = new Customer();
        saved.setId(1L);
        saved.setFirstName(req.firstName);
        saved.setLastName(req.lastName);
        saved.setEmail(req.email);
        saved.setPhone(req.phone);
        saved.setDob(req.dob);
        saved.setCreatedAt(Instant.parse("2024-01-01T00:00:00Z"));

        Mockito.when(bankingService.createCustomer(any(CustomerDtos.CreateCustomerRequest.class)))
                .thenReturn(saved);

        mockMvc.perform(post("/api/customers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.firstName", is("Alice")))
                .andExpect(jsonPath("$.email", is("alice@example.com")));
    }

    @Test
    void getCustomer_returnsOk() throws Exception {
        Customer c = new Customer();
        c.setId(5L);
        c.setFirstName("Bob");
        c.setLastName("Smith");
        c.setEmail("bob@example.com");
        c.setPhone("9876543210");
        c.setDob(LocalDate.of(1985, 5, 20));
        c.setCreatedAt(Instant.parse("2024-02-02T00:00:00Z"));

        Mockito.when(bankingService.getCustomer(eq(5L))).thenReturn(c);

        mockMvc.perform(get("/api/customers/5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(5)))
                .andExpect(jsonPath("$.firstName", is("Bob")))
                .andExpect(jsonPath("$.email", is("bob@example.com")));
    }
}

