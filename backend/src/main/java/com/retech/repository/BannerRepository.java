package com.retech.repository;

import com.retech.model.*;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface BannerRepository extends MongoRepository<Banner, String> {
    List<Banner> findByActiveTrueOrderBySortOrderAsc();
    List<Banner> findAllByOrderBySortOrderAsc();
}
