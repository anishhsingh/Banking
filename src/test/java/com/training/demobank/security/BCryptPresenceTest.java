package com.training.demobank.security;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class BCryptPresenceTest {

    @Autowired
    BCryptPasswordEncoder encoder;

    @Test
    void bcryptEncoderBeanWorks() {
        assertNotNull(encoder, "BCryptPasswordEncoder bean should be injected");
        String raw = "SamplePass123!";
        String hash = encoder.encode(raw);
        assertTrue(hash.startsWith("$2"), "Hash should be a bcrypt hash");
        assertTrue(encoder.matches(raw, hash), "Encoded hash must match original password");
        assertFalse(encoder.matches("WrongPass", hash), "Mismatched password should not validate");
    }
}

