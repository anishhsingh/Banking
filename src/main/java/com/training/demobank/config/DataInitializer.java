package com.training.demobank.config;

import com.training.demobank.model.Account;
import com.training.demobank.model.AccountType;
import com.training.demobank.model.BankTransaction;
import com.training.demobank.model.Customer;
import com.training.demobank.repository.AccountRepository;
import com.training.demobank.repository.BankTransactionRepository;
import com.training.demobank.repository.CustomerRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

@Configuration
public class DataInitializer {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    @Value("${demobank.seed.test-user:true}")
    private boolean seedTestUser;

    @Value("${demobank.seed.demo-accounts:true}")
    private boolean seedDemoAccounts;

    @Bean
    @Transactional
    ApplicationRunner seedDefaultUser(CustomerRepository customerRepository,
                                      AccountRepository accountRepository,
                                      BankTransactionRepository txRepository,
                                      org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder encoder) {
        return args -> {
            if (!seedTestUser) {
                log.info("Test user seeding disabled (demobank.seed.test-user=false)");
                return;
            }
            String email = "test@example.com";
            Customer test = customerRepository.findByEmail(email).orElseGet(() -> {
                Customer c = new Customer();
                c.setFirstName("Test");
                c.setLastName("User");
                c.setEmail(email);
                c.setPhone("1234567890");
                c.setDob(LocalDate.of(1990, 1, 1));
                c.setPasswordHash(encoder.encode("Password123!"));
                Customer saved = customerRepository.save(c);
                log.info("Seeded test user '{}', id={} (default password: Password123!)", saved.getEmail(), saved.getId());
                return saved;
            });

            if (test.getPasswordHash() == null) {
                test.setPasswordHash(encoder.encode("Password123!"));
                customerRepository.save(test);
            }

            if (seedDemoAccounts) {
                if (accountRepository.findByCustomer_Id(test.getId()).isEmpty()) {
                    Account savings = new Account();
                    savings.setCustomer(test);
                    savings.setAccountType(AccountType.SAVINGS);
                    savings.setBalance(new BigDecimal("1000.00"));
                    savings.setInterestRate(new BigDecimal("0.0250"));
                    savings.setAccountNumber("DEMO-SAV-" + System.currentTimeMillis());
                    savings = accountRepository.save(savings);

                    Account current = new Account();
                    current.setCustomer(test);
                    current.setAccountType(AccountType.CURRENT);
                    current.setBalance(new BigDecimal("250.00"));
                    current.setOverdraftLimit(new BigDecimal("500.00"));
                    current.setAccountNumber("DEMO-CUR-" + System.currentTimeMillis());
                    current = accountRepository.save(current);

                    BankTransaction t1 = new BankTransaction();
                    t1.setAccount(savings);
                    t1.setTxnType("DEPOSIT");
                    t1.setAmount(new BigDecimal("1000.00"));
                    t1.setNote("Initial seed");
                    txRepository.save(t1);

                    BankTransaction t2 = new BankTransaction();
                    t2.setAccount(current);
                    t2.setTxnType("DEPOSIT");
                    t2.setAmount(new BigDecimal("250.00"));
                    t2.setNote("Initial seed");
                    txRepository.save(t2);

                    log.info("Seeded demo accounts for test user (savings id={}, current id={})", savings.getId(), current.getId());
                }
            }
        };
    }
}
