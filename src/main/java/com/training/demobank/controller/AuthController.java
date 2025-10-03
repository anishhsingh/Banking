package com.training.demobank.controller;

import com.training.demobank.model.Customer;
import com.training.demobank.service.BankingService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4201")
public class AuthController {
    private final BankingService bankingService;
    private final BCryptPasswordEncoder passwordEncoder; // now mandatory
    private static final String INVALID_MESSAGE = "Invalid credentials"; // Unified failure message

    public AuthController(BankingService bankingService, BCryptPasswordEncoder passwordEncoder) {
        this.bankingService = bankingService;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody LoginRequest request) {
        Map<String, Object> response = new HashMap<>();
        if (isBlank(request.getEmail()) || isBlank(request.getPassword())) {
            response.put("success", false);
            response.put("message", INVALID_MESSAGE);
            return response;
        }
        try {
            Customer customer = bankingService.getCustomerByEmail(request.getEmail().trim());
            String stored = customer.getPasswordHash();
            if (stored == null || stored.isBlank() || !passwordEncoder.matches(request.getPassword(), stored)) {
                throw new IllegalArgumentException("Password mismatch");
            }
            response.put("success", true);
            response.put("message", "Login successful");
            response.put("token", generatePseudoToken(customer.getId()));
            response.put("user", toUserMap(customer));
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", INVALID_MESSAGE);
        }
        return response;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> register(@RequestBody RegisterRequest request) {
        Map<String, Object> response = new HashMap<>();
        if (isBlank(request.getEmail())) {
            response.put("success", false);
            response.put("message", INVALID_MESSAGE);
            return response;
        }
        try {
            com.training.demobank.dto.CustomerDtos.CreateCustomerRequest req = new com.training.demobank.dto.CustomerDtos.CreateCustomerRequest();
            req.firstName = request.getFirstName();
            req.lastName = request.getLastName();
            req.email = request.getEmail();
            req.phone = request.getPhone();
            req.dob = request.getDob();
            Customer c = bankingService.createCustomer(req);
            if (!isBlank(request.getPassword())) {
                String hash = passwordEncoder.encode(request.getPassword());
                c = bankingService.updatePasswordHash(c.getId(), hash);
            }
            response.put("success", true);
            response.put("message", "Registration successful");
            response.put("token", generatePseudoToken(c.getId()));
            response.put("user", toUserMap(c));
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", INVALID_MESSAGE);
        }
        return response;
    }

    // Helper methods
    private boolean isBlank(String s){ return s == null || s.trim().isEmpty(); }
    private String generatePseudoToken(Long id){ return "demo-token-"+id+"-"+System.currentTimeMillis(); }

    private Map<String,Object> toUserMap(Customer c) {
        Map<String,Object> m = new HashMap<>();
        m.put("id", c.getId());
        m.put("firstName", c.getFirstName());
        m.put("lastName", c.getLastName());
        m.put("email", c.getEmail());
        m.put("phone", c.getPhone());
        m.put("dob", c.getDob());
        m.put("createdAt", c.getCreatedAt());
        return m;
    }

    // Request payload classes
    public static class LoginRequest {
        private String email;
        private String password;
        public String getEmail() {return email;}
        public void setEmail(String email) {this.email = email;}
        public String getPassword() {return password;}
        public void setPassword(String password) {this.password = password;}
    }
    public static class RegisterRequest {
        private String firstName; private String lastName; private String email; private String password; private String phone; private java.time.LocalDate dob;
        public String getFirstName(){return firstName;} public void setFirstName(String firstName){this.firstName=firstName;}
        public String getLastName(){return lastName;} public void setLastName(String lastName){this.lastName=lastName;}
        public String getEmail(){return email;} public void setEmail(String email){this.email=email;}
        public String getPassword(){return password;} public void setPassword(String password){this.password=password;}
        public String getPhone(){return phone;} public void setPhone(String phone){this.phone=phone;}
        public java.time.LocalDate getDob(){return dob;} public void setDob(java.time.LocalDate dob){this.dob=dob;}
    }
}
