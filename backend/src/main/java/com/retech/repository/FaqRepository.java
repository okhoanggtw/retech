package com.retech.repository;

import com.retech.model.*;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface FaqRepository extends MongoRepository<Faq, String> {
    List<Faq> findAllByOrderBySortOrderAsc();
}
