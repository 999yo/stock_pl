package com.stockpl.repository;

import com.stockpl.model.Transaction;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Repository
public class TransactionRepository {

    private final ConcurrentHashMap<Long, Transaction> store = new ConcurrentHashMap<>();
    private final AtomicLong idSequence = new AtomicLong(1);

    public Transaction save(Transaction transaction) {
        Long id = transaction.id() != null ? transaction.id() : idSequence.getAndIncrement();
        Transaction saved = new Transaction(
                id,
                transaction.symbol(),
                transaction.type(),
                transaction.quantity(),
                transaction.price(),
                transaction.tradedAt()
        );
        store.put(id, saved);
        return saved;
    }

    public List<Transaction> findAll() {
        return store.values().stream()
                .sorted(Comparator.comparing(Transaction::tradedAt).thenComparing(Transaction::id))
                .toList();
    }

    public Optional<Transaction> findById(Long id) {
        return Optional.ofNullable(store.get(id));
    }

    public boolean deleteById(Long id) {
        return store.remove(id) != null;
    }

    public void deleteAll() {
        store.clear();
        idSequence.set(1);
    }
}
