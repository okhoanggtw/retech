package com.retech.repository;

import com.retech.model.*;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface TradeInRepository extends MongoRepository<TradeIn, String> {
    List<TradeIn> findByUserIdOrderByCreatedAtDesc(String userId);
}
