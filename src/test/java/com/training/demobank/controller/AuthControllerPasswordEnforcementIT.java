package com.training.demobank.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.hamcrest.Matchers.is;

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerPasswordEnforcementIT {

    @Autowired
    MockMvc mockMvc;

    @Test
    void registrationHashesPassword_andLoginRequiresCorrectPassword() throws Exception {
        String email = "it-" + UUID.randomUUID() + "@example.com";
        String password = "Secret123!";
        String badPassword = "WrongPass!";

        String registerJson = "{" +
                "\"firstName\":\"IT\"," +
                "\"lastName\":\"Test\"," +
                "\"email\":\"" + email + "\"," +
                "\"phone\":\"123456\"," +
                "\"dob\":\"1990-01-01\"," +
                "\"password\":\"" + password + "\"}";

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)));

        String wrongLoginJson = "{" +
                "\"email\":\"" + email + "\"," +
                "\"password\":\"" + badPassword + "\"}";

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(wrongLoginJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(false)));

        String goodLoginJson = "{" +
                "\"email\":\"" + email + "\"," +
                "\"password\":\"" + password + "\"}";

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(goodLoginJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)));
    }
}

