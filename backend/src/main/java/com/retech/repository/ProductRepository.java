package com.retech.repository;

import com.retech.model.*;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends MongoRepository<Product, String> {
    Optional<Product> findBySlug(String slug);
    boolean existsBySlug(String slug);
    List<Product> findByActiveTrueAndFeaturedTrue();
    List<Product> findByCategoryAndActiveTrue(String category);
    List<Product> findByBrandIgnoreCaseAndCategoryAndActiveTrue(String brand, String category);
}
