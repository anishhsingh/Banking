package com.training.demobank.service;

import com.training.demobank.dto.AccountDtos;
import com.training.demobank.model.Account;
import com.training.demobank.model.AccountType;
import com.training.demobank.model.Customer;
import com.training.demobank.repository.AccountRepository;
import com.training.demobank.repository.BankTransactionRepository;
import com.training.demobank.repository.CustomerRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.ANY)
@Import(BankingService.class)
class BankingServiceEdgeTest {

    @Autowired BankingService bankingService;
    @Autowired CustomerRepository customerRepository;
    @Autowired AccountRepository accountRepository;
    @Autowired BankTransactionRepository txRepository;

    Long customerId;

    @BeforeEach
    void init(){
        Customer c = new Customer();
        c.setFirstName("Edge");
        c.setEmail("edge@test");
        customerId = customerRepository.save(c).getId();
    }

    private Account create(AccountType type, BigDecimal opening, BigDecimal overdraft){
        AccountDtos.CreateAccountRequest r = new AccountDtos.CreateAccountRequest();
        r.customerId = customerId;
        r.accountType = type;
        r.openingBalance = opening;
        r.overdraftLimit = overdraft;
        return bankingService.createAccount(r);
    }

    @Test
    void transfer_sameAccount_rejected(){
        Account a = create(AccountType.SAVINGS, new BigDecimal("100.00"), null);
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> bankingService.transfer(a.getId(), a.getId(), new BigDecimal("10.00"), "loop"));
        assertTrue(ex.getMessage().toLowerCase().contains("same account"));
    }

    @Test
    void overdraft_exceed_rejected(){
        Account current = create(AccountType.CURRENT, BigDecimal.ZERO, new BigDecimal("50.00"));
        // Withdraw to limit -50
        current = bankingService.withdraw(current.getId(), new BigDecimal("50.00"), "reach limit");
        assertEquals(new BigDecimal("-50.00"), current.getBalance());
        // Exceed using final id variable
        final Long currentId = current.getId();
        IllegalStateException ex = assertThrows(IllegalStateException.class,
                () -> bankingService.withdraw(currentId, new BigDecimal("1.00"), "exceed"));
        assertTrue(ex.getMessage().toLowerCase().contains("overdraft"));
    }
}
