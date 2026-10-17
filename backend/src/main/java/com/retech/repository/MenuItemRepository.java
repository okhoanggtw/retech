package com.retech.repository;

import com.retech.model.*;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface MenuItemRepository extends MongoRepository<MenuItem, String> {
    List<MenuItem> findByActiveTrueOrderBySortOrderAsc();
    List<MenuItem> findAllByOrderBySortOrderAsc();
}
