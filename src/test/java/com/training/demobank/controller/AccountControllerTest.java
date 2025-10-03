package com.training.demobank.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.training.demobank.dto.AccountDtos;
import com.training.demobank.model.Account;
import com.training.demobank.model.AccountType;
import com.training.demobank.model.BankTransaction;
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

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = AccountController.class)
@AutoConfigureMockMvc
class AccountControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private BankingService bankingService;

    private Account sampleAccount(Long id) {
        Customer cust = new Customer();
        cust.setId(1L);
        Account a = new Account();
        a.setId(id);
        a.setCustomer(cust);
        a.setAccountType(AccountType.SAVINGS);
        a.setAccountNumber("AC123");
        a.setBalance(new BigDecimal("100.00"));
        a.setOpenedAt(Instant.parse("2024-01-01T00:00:00Z"));
        a.setStatus("ACTIVE");
        return a;
    }

    @Test
    void createAccount_returnsCreated() throws Exception {
        AccountDtos.CreateAccountRequest req = new AccountDtos.CreateAccountRequest();
        req.customerId = 1L;
        req.accountType = AccountType.SAVINGS;
        req.openingBalance = new BigDecimal("100.00");
        req.interestRate = new BigDecimal("0.025");

        Mockito.when(bankingService.createAccount(any(AccountDtos.CreateAccountRequest.class)))
                .thenReturn(sampleAccount(10L));

        mockMvc.perform(post("/api/accounts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", is(10)))
                .andExpect(jsonPath("$.accountNumber", is("AC123")))
                .andExpect(jsonPath("$.customerId", is(1)))
                .andExpect(jsonPath("$.accountType", is("SAVINGS")))
                .andExpect(jsonPath("$.balance", is(100.00)));
    }

    @Test
    void getAccount_returnsOk() throws Exception {
        Mockito.when(bankingService.getAccount(eq(10L))).thenReturn(sampleAccount(10L));

        mockMvc.perform(get("/api/accounts/10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(10)))
                .andExpect(jsonPath("$.accountType", is("SAVINGS")));
    }

    @Test
    void deposit_returnsOk() throws Exception {
        Account updated = sampleAccount(10L);
        updated.setBalance(new BigDecimal("150.00"));
        AccountDtos.MoneyRequest req = new AccountDtos.MoneyRequest();
        req.amount = new BigDecimal("50.00");
        req.note = "cash";

        Mockito.when(bankingService.deposit(eq(10L), eq(new BigDecimal("50.00")), eq("cash")))
                .thenReturn(updated);

        mockMvc.perform(post("/api/accounts/10/deposit")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.balance", is(150.00)));
    }

    @Test
    void withdraw_returnsOk() throws Exception {
        Account updated = sampleAccount(10L);
        updated.setBalance(new BigDecimal("80.00"));
        AccountDtos.MoneyRequest req = new AccountDtos.MoneyRequest();
        req.amount = new BigDecimal("20.00");
        req.note = "atm";

        Mockito.when(bankingService.withdraw(eq(10L), eq(new BigDecimal("20.00")), eq("atm")))
                .thenReturn(updated);

        mockMvc.perform(post("/api/accounts/10/withdraw")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.balance", is(80.00)));
    }

    @Test
    void transfer_returnsNoContent() throws Exception {
        AccountDtos.TransferRequest req = new AccountDtos.TransferRequest();
        req.fromAccountId = 10L;
        req.toAccountId = 11L;
        req.amount = new BigDecimal("10.00");
        req.note = "move";

        Mockito.doNothing().when(bankingService).transfer(eq(10L), eq(11L), eq(new BigDecimal("10.00")), eq("move"));

        mockMvc.perform(post("/api/accounts/transfer")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isNoContent());
    }

    @Test
    void listTransactions_returnsOk() throws Exception {
        BankTransaction t = new BankTransaction();
        t.setId(1L);
        t.setAmount(new BigDecimal("10.00"));
        t.setTxnType("DEPOSIT");
        t.setTxnDate(Instant.parse("2024-01-02T00:00:00Z"));

        Mockito.when(bankingService.listTransactions(eq(10L)))
                .thenReturn(List.of(t));

        mockMvc.perform(get("/api/accounts/10/transactions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].txnType", is("DEPOSIT")))
                .andExpect(jsonPath("$[0].amount", is(10.00)));
    }
}
