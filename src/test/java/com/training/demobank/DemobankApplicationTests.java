package com.training.demobank;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
@Disabled("Disabled default context test to avoid requiring a live DB; add proper test config later")
class DemobankApplicationTests {

	@Test
	void contextLoads() {
	}

}
