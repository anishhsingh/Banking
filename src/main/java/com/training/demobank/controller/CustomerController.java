package com.training.demobank.controller;

import com.training.demobank.dto.CustomerDtos;
import com.training.demobank.model.Customer;
import com.training.demobank.service.BankingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customers")
@CrossOrigin(origins = "http://localhost:4201")
public class CustomerController {
    private final BankingService bankingService;

    public CustomerController(BankingService bankingService) {
        this.bankingService = bankingService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CustomerDtos.CustomerResponse create(@RequestBody @Valid CustomerDtos.CreateCustomerRequest req) {
        Customer c = bankingService.createCustomer(req);
        return toDto(c);
    }

    @GetMapping("/{id}")
    public CustomerDtos.CustomerResponse get(@PathVariable Long id) {
        return toDto(bankingService.getCustomer(id));
    }

    private static CustomerDtos.CustomerResponse toDto(Customer c) {
        CustomerDtos.CustomerResponse dto = new CustomerDtos.CustomerResponse();
        dto.id = c.getId();
        dto.firstName = c.getFirstName();
        dto.lastName = c.getLastName();
        dto.email = c.getEmail();
        dto.phone = c.getPhone();
        dto.dob = c.getDob();
        dto.createdAt = c.getCreatedAt();
        return dto;
    }
}
