package com.training.demobank.service;

import com.training.demobank.dto.AccountDtos;
import com.training.demobank.dto.CustomerDtos;
import com.training.demobank.model.*;
import com.training.demobank.repository.AccountRepository;
import com.training.demobank.repository.BankTransactionRepository;
import com.training.demobank.repository.CustomerRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class BankingService {
    private final CustomerRepository customerRepository;
    private final AccountRepository accountRepository;
    private final BankTransactionRepository transactionRepository;

    public BankingService(CustomerRepository customerRepository,
                          AccountRepository accountRepository,
                          BankTransactionRepository transactionRepository) {
        this.customerRepository = customerRepository;
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
    }

    public Customer createCustomer(CustomerDtos.CreateCustomerRequest req) {
        Customer c = new Customer();
        c.setFirstName(req.firstName);
        c.setLastName(req.lastName);
        c.setEmail(req.email);
        c.setPhone(req.phone);
        c.setDob(req.dob);
        return customerRepository.save(c);
    }

    public Customer getCustomer(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found: " + id));
    }

    public Customer getCustomerByEmail(String email) {
        String normalized = email == null ? null : email.trim();
        if (normalized == null || normalized.isEmpty()) {
            throw new IllegalArgumentException("Email required");
        }
        return customerRepository.findByEmailIgnoreCase(normalized)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found with email: " + normalized));
    }

    public Account getAccount(Long id) {
        return accountRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Account not found: " + id));
    }

    public Account getAccountByNumber(String accountNumber) {
        return accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new IllegalArgumentException("Account not found: " + accountNumber));
    }

    @Transactional
    public Account createAccount(AccountDtos.CreateAccountRequest req) {
        Customer customer = getCustomer(req.customerId);

        Account a = new Account();
        a.setCustomer(customer);
        a.setAccountType(req.accountType);
        a.setInterestRate(req.interestRate);
        a.setOverdraftLimit(req.overdraftLimit);
        a.setStatus("ACTIVE");

        if (req.accountNumber != null && !req.accountNumber.isBlank()) {
            a.setAccountNumber(req.accountNumber);
        } else {
            a.setAccountNumber(generateAccountNumber());
        }

        if (req.openingBalance != null && req.openingBalance.compareTo(BigDecimal.ZERO) > 0) {
            a.setBalance(req.openingBalance);
        } else {
            a.setBalance(BigDecimal.ZERO);
        }

        Account saved = accountRepository.save(a);

        if (saved.getBalance().compareTo(BigDecimal.ZERO) > 0) {
            recordTransaction(saved, "DEPOSIT", saved.getBalance(), "Opening balance");
        }

        return saved;
    }

    @Transactional
    public Account deposit(Long accountId, BigDecimal amount, String note) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Amount must be positive");
        }
        Account acc = accountRepository.findWithLockingById(accountId)
                .orElseThrow(() -> new IllegalArgumentException("Account not found: " + accountId));
        ensureActive(acc);
        acc.setBalance(acc.getBalance().add(amount));
        Account saved = accountRepository.save(acc);
        recordTransaction(saved, "DEPOSIT", amount, note);
        return saved;
    }

    @Transactional
    public Account withdraw(Long accountId, BigDecimal amount, String note) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Amount must be positive");
        }
        Account acc = accountRepository.findWithLockingById(accountId)
                .orElseThrow(() -> new IllegalArgumentException("Account not found: " + accountId));
        ensureActive(acc);

        BigDecimal newBalance = acc.getBalance().subtract(amount);
        if (acc.getAccountType() == AccountType.SAVINGS) {
            if (newBalance.compareTo(BigDecimal.ZERO) < 0) {
                throw new IllegalStateException("Insufficient funds for savings account");
            }
        } else {
            BigDecimal limit = acc.getOverdraftLimit() == null ? BigDecimal.ZERO : acc.getOverdraftLimit();
            if (newBalance.compareTo(limit.negate()) < 0) {
                throw new IllegalStateException("Overdraft limit exceeded");
            }
        }

        acc.setBalance(newBalance);
        Account saved = accountRepository.save(acc);
        recordTransaction(saved, "WITHDRAWAL", amount, note);
        return saved;
    }

    @Transactional
    public void transfer(Long fromAccountId, Long toAccountId, BigDecimal amount, String note) {
        if (fromAccountId.equals(toAccountId)) {
            throw new IllegalArgumentException("Cannot transfer to the same account");
        }
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Amount must be positive");
        }
        // Lock source first, then destination with id ordering to avoid deadlocks
        Long firstId = Math.min(fromAccountId, toAccountId);
        Long secondId = Math.max(fromAccountId, toAccountId);
        Account first = accountRepository.findWithLockingById(firstId)
                .orElseThrow(() -> new IllegalArgumentException("Account not found: " + firstId));
        Account second = accountRepository.findWithLockingById(secondId)
                .orElseThrow(() -> new IllegalArgumentException("Account not found: " + secondId));
        Account from = fromAccountId.equals(firstId) ? first : second;
        Account to = toAccountId.equals(secondId) ? second : first;

        ensureActive(from);
        ensureActive(to);

        // Withdraw from source
        BigDecimal newFrom = from.getBalance().subtract(amount);
        if (from.getAccountType() == AccountType.SAVINGS) {
            if (newFrom.compareTo(BigDecimal.ZERO) < 0) {
                throw new IllegalStateException("Insufficient funds for savings account");
            }
        } else {
            BigDecimal limit = from.getOverdraftLimit() == null ? BigDecimal.ZERO : from.getOverdraftLimit();
            if (newFrom.compareTo(limit.negate()) < 0) {
                throw new IllegalStateException("Overdraft limit exceeded");
            }
        }
        from.setBalance(newFrom);
        accountRepository.save(from);
        recordTransaction(from, "TRANSFER_OUT", amount, note);

        // Deposit to destination
        to.setBalance(to.getBalance().add(amount));
        accountRepository.save(to);
        recordTransaction(to, "TRANSFER_IN", amount, note);
    }

    public List<BankTransaction> listTransactions(Long accountId) {
        return transactionRepository.findByAccount_IdOrderByTxnDateDesc(accountId);
    }

    public List<Account> getAllAccounts() {
        return accountRepository.findAll();
    }

    public List<Account> getAccountsByCustomerId(Long customerId) {
        return accountRepository.findByCustomer_Id(customerId);
    }

    public List<BankTransaction> getAllTransactions() {
        return transactionRepository.findAllByOrderByTxnDateDesc();
    }

    private void ensureActive(Account acc) {
        if (!"ACTIVE".equalsIgnoreCase(acc.getStatus())) {
            throw new IllegalStateException("Account not active");
        }
    }

    private void recordTransaction(Account account, String type, BigDecimal amount, String note) {
        BankTransaction t = new BankTransaction();
        t.setAccount(account);
        t.setTxnType(type);
        t.setAmount(amount);
        t.setNote(note);
        transactionRepository.save(t);
    }

    private String generateAccountNumber() {
        // Simple unique-ish generator; in production, use a robust generator
        long epochPart = System.currentTimeMillis();
        long rand = (long) (Math.random() * 1_000_000L);
        return "AC" + epochPart + String.format("%06d", rand);
    }

    @Transactional
    public Customer updatePasswordHash(Long customerId, String passwordHash) {
        if (passwordHash == null || passwordHash.isBlank()) {
            throw new IllegalArgumentException("Password hash must not be blank");
        }
        Customer c = getCustomer(customerId);
        c.setPasswordHash(passwordHash);
        return customerRepository.save(c);
    }
}
