package com.training.demobank.controller;

import com.training.demobank.dto.AccountDtos;
import com.training.demobank.model.Account;
import com.training.demobank.model.BankTransaction;
import com.training.demobank.service.BankingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/accounts")
@CrossOrigin(origins = "http://localhost:4201")
public class AccountController {
    private final BankingService bankingService;

    public AccountController(BankingService bankingService) {
        this.bankingService = bankingService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AccountDtos.AccountResponse create(@RequestBody @Valid AccountDtos.CreateAccountRequest req) {
        return toDto(bankingService.createAccount(req));
    }

    @GetMapping("/{id}")
    public AccountDtos.AccountResponse get(@PathVariable Long id) {
        return toDto(bankingService.getAccount(id));
    }

    @PostMapping("/{id}/deposit")
    public AccountDtos.AccountResponse deposit(@PathVariable Long id, @RequestBody @Valid AccountDtos.MoneyRequest req) {
        return toDto(bankingService.deposit(id, req.amount, req.note));
    }

    @PostMapping("/{id}/withdraw")
    public AccountDtos.AccountResponse withdraw(@PathVariable Long id, @RequestBody @Valid AccountDtos.MoneyRequest req) {
        return toDto(bankingService.withdraw(id, req.amount, req.note));
    }

    @GetMapping
    public List<AccountDtos.AccountResponse> getAllAccounts(@RequestParam(required = false) Long customerId) {
        List<Account> accounts;
        if (customerId != null) {
            accounts = bankingService.getAccountsByCustomerId(customerId);
        } else {
            accounts = bankingService.getAllAccounts();
        }
        return accounts.stream().map(AccountController::toDto).toList();
    }

    @GetMapping("/transactions")
    public List<AccountDtos.TransactionResponse> getAllTransactions(@RequestParam(required = false) Long accountId) {
        List<BankTransaction> txns;
        if (accountId != null) {
            txns = bankingService.listTransactions(accountId);
        } else {
            txns = bankingService.getAllTransactions();
        }
        return txns.stream().map(this::toTxnDto).toList();
    }

    @GetMapping("/{id}/transactions")
    public List<AccountDtos.TransactionResponse> getTransactionsForAccount(@PathVariable Long id) {
        return bankingService.listTransactions(id).stream().map(this::toTxnDto).toList();
    }

    @PostMapping("/transfer")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void transfer(@RequestBody @Valid AccountDtos.TransferRequest req) {
        bankingService.transfer(req.fromAccountId, req.toAccountId, req.amount, req.note);
    }

    private static AccountDtos.AccountResponse toDto(Account a) {
        AccountDtos.AccountResponse dto = new AccountDtos.AccountResponse();
        dto.id = a.getId();
        dto.accountNumber = a.getAccountNumber();
        dto.customerId = a.getCustomer() != null ? a.getCustomer().getId() : null;
        dto.accountType = a.getAccountType();
        dto.balance = a.getBalance();
        dto.openedAt = a.getOpenedAt();
        dto.interestRate = a.getInterestRate();
        dto.overdraftLimit = a.getOverdraftLimit();
        dto.status = a.getStatus();
        return dto;
    }

    private AccountDtos.TransactionResponse toTxnDto(BankTransaction t) {
        AccountDtos.TransactionResponse dto = new AccountDtos.TransactionResponse();
        dto.id = t.getId();
        dto.accountId = t.getAccount() != null ? t.getAccount().getId() : null;
        dto.txnType = t.getTxnType();
        dto.amount = t.getAmount();
        dto.txnDate = t.getTxnDate();
        dto.note = t.getNote();
        return dto;
    }
}
