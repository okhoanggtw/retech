package com.retech.repository;

import com.retech.model.*;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface PromotionRepository extends MongoRepository<Promotion, String> {
    Optional<Promotion> findByCodeIgnoreCase(String code);
    List<Promotion> findByActiveTrue();
}
