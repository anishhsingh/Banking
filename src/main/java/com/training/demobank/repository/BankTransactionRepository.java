package com.training.demobank.repository;

import com.training.demobank.model.BankTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BankTransactionRepository extends JpaRepository<BankTransaction, Long> {
    List<BankTransaction> findByAccount_IdOrderByTxnDateDesc(Long accountId);
    List<BankTransaction> findAllByOrderByTxnDateDesc();
}
