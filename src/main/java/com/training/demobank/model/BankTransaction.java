package com.training.demobank.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "transactions")
public class BankTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "account_id", nullable = false)
    @JsonIgnore
    private Account account;

    @Column(name = "txn_type", nullable = false, length = 20)
    private String txnType; // e.g., DEPOSIT, WITHDRAWAL, TRANSFER_IN, TRANSFER_OUT

    @Column(name = "amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal amount;

    @Column(name = "txn_date")
    private Instant txnDate;

    @Column(name = "note")
    private String note;

    @PrePersist
    void prePersist() {
        if (txnDate == null) txnDate = Instant.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Account getAccount() { return account; }
    public void setAccount(Account account) { this.account = account; }

    public String getTxnType() { return txnType; }
    public void setTxnType(String txnType) { this.txnType = txnType; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public Instant getTxnDate() { return txnDate; }
    public void setTxnDate(Instant txnDate) { this.txnDate = txnDate; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}
