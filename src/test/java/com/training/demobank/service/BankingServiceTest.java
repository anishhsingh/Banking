package com.training.demobank.service;

import com.training.demobank.dto.AccountDtos;
import com.training.demobank.dto.CustomerDtos;
import com.training.demobank.model.Account;
import com.training.demobank.model.AccountType;
import com.training.demobank.model.BankTransaction;
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
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.ANY)
@Import(BankingService.class)
class BankingServiceTest {

    @Autowired
    private BankingService bankingService;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private BankTransactionRepository txRepository;

    private Long customerId;

    @BeforeEach
    void setup() {
        Customer c = new Customer();
        c.setFirstName("Test");
        c.setLastName("User");
        c.setEmail("test@example.com");
        c.setPhone("000");
        customerId = customerRepository.save(c).getId();
    }

    @Test
    void createAccount_and_openingBalanceTransaction() {
        AccountDtos.CreateAccountRequest req = new AccountDtos.CreateAccountRequest();
        req.customerId = customerId;
        req.accountType = AccountType.SAVINGS;
        req.openingBalance = new BigDecimal("100.00");
        req.interestRate = new BigDecimal("0.0100");

        Account a = bankingService.createAccount(req);
        assertNotNull(a.getId());
        assertEquals(new BigDecimal("100.00"), a.getBalance());

        List<BankTransaction> txs = txRepository.findByAccount_IdOrderByTxnDateDesc(a.getId());
        assertEquals(1, txs.size());
        assertEquals("DEPOSIT", txs.get(0).getTxnType());
        assertEquals(new BigDecimal("100.00"), txs.get(0).getAmount());
    }

    @Test
    void deposit_and_withdraw_savings_rules() {
        AccountDtos.CreateAccountRequest req = new AccountDtos.CreateAccountRequest();
        req.customerId = customerId;
        req.accountType = AccountType.SAVINGS;
        req.openingBalance = new BigDecimal("50.00");
        Account a = bankingService.createAccount(req);

        // deposit 25
        a = bankingService.deposit(a.getId(), new BigDecimal("25.00"), "cash");
        assertEquals(new BigDecimal("75.00"), a.getBalance());

        // withdraw 70 ok
        a = bankingService.withdraw(a.getId(), new BigDecimal("70.00"), "atm");
        assertEquals(new BigDecimal("5.00"), a.getBalance());

        // withdraw 10 should fail (insufficient funds for savings)
        final Long savingsId = a.getId();
        IllegalStateException ex = assertThrows(IllegalStateException.class,
                () -> bankingService.withdraw(savingsId, new BigDecimal("10.00"), "atm2"));
        assertTrue(ex.getMessage().toLowerCase().contains("insufficient"));
    }

    @Test
    void current_overdraft_rules_and_transfer() {
        // Create two accounts
        AccountDtos.CreateAccountRequest curReq = new AccountDtos.CreateAccountRequest();
        curReq.customerId = customerId;
        curReq.accountType = AccountType.CURRENT;
        curReq.openingBalance = new BigDecimal("0.00");
        curReq.overdraftLimit = new BigDecimal("100.00");
        Account current = bankingService.createAccount(curReq);

        AccountDtos.CreateAccountRequest savReq = new AccountDtos.CreateAccountRequest();
        savReq.customerId = customerId;
        savReq.accountType = AccountType.SAVINGS;
        savReq.openingBalance = new BigDecimal("10.00");
        Account savings = bankingService.createAccount(savReq);

        // Withdraw 50 from current -> allowed due to overdraft
        current = bankingService.withdraw(current.getId(), new BigDecimal("50.00"), "pos");
        assertEquals(new BigDecimal("-50.00"), current.getBalance());

        // Transfer 5 from savings to current
        bankingService.transfer(savings.getId(), current.getId(), new BigDecimal("5.00"), "move");
        current = accountRepository.findById(current.getId()).orElseThrow();
        savings = accountRepository.findById(savings.getId()).orElseThrow();
        assertEquals(new BigDecimal("-45.00"), current.getBalance());
        assertEquals(new BigDecimal("5.00"), savings.getBalance());

        // Exceed overdraft: withdrawing beyond -100 should fail
        final Long currentId = current.getId();
        IllegalStateException ex = assertThrows(IllegalStateException.class,
                () -> bankingService.withdraw(currentId, new BigDecimal("60.01"), "too much"));
        assertTrue(ex.getMessage().toLowerCase().contains("overdraft"));
    }

    @Test
    void bad_amount_validation() {
        AccountDtos.CreateAccountRequest req = new AccountDtos.CreateAccountRequest();
        req.customerId = customerId;
        req.accountType = AccountType.SAVINGS;
        Account a = bankingService.createAccount(req);

        final Long id = a.getId();
        assertThrows(IllegalArgumentException.class,
                () -> bankingService.deposit(id, new BigDecimal("0.00"), null));
        assertThrows(IllegalArgumentException.class,
                () -> bankingService.withdraw(id, new BigDecimal("-1.00"), null));
    }
}
