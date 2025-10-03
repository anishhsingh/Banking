package com.training.demobank.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.time.LocalDate;

public class CustomerDtos {
    public static class CreateCustomerRequest {
        @NotBlank
        @Size(max = 100)
        public String firstName;
        @Size(max = 100)
        public String lastName;
        @Email
        @Size(max = 255)
        public String email;
        @Size(max = 20)
        public String phone;
        public LocalDate dob;
    }

    public static class CustomerResponse {
        public Long id;
        public String firstName;
        public String lastName;
        public String email;
        public String phone;
        public LocalDate dob;
        public Instant createdAt;
    }
}

