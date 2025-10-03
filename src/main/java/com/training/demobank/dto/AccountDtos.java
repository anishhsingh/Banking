package com.training.demobank.dto;

import com.training.demobank.model.AccountType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.Instant;

public class AccountDtos {
    public static class CreateAccountRequest {
        @NotNull
        public Long customerId;
        @NotNull
        public AccountType accountType;
        public BigDecimal openingBalance;
        public BigDecimal interestRate; // for savings
        public BigDecimal overdraftLimit; // for current
        public String accountNumber; // optional custom number
    }

    public static class AccountResponse {
        public Long id;
        public String accountNumber;
        public Long customerId;
        public AccountType accountType;
        public BigDecimal balance;
        public Instant openedAt;
        public BigDecimal interestRate;
        public BigDecimal overdraftLimit;
        public String status;
    }

    public static class BalanceResponse {
        public Long accountId;
        public BigDecimal balance;
    }

    public static class MoneyRequest {
        @NotNull
        @DecimalMin(value = "0.01")
        public BigDecimal amount;
        public String note;
    }

    public static class TransferRequest {
        @NotNull
        public Long fromAccountId;
        @NotNull
        public Long toAccountId;
        @NotNull
        @DecimalMin(value = "0.01")
        public BigDecimal amount;
        public String note;
    }

    public static class TransactionResponse {
        public Long id;
        public Long accountId;
        public String txnType;
        public BigDecimal amount;
        public Instant txnDate;
        public String note;
    }
}
