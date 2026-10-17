package com.retech.config;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import de.bwaldvogel.mongo.MongoServer;
import de.bwaldvogel.mongo.MongoVersion;
import de.bwaldvogel.mongo.backend.memory.MemoryBackend;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.net.InetSocketAddress;

/**
 * Khi app.embedded-mongo=true: khoi dong 1 MongoDB gia lap trong RAM.
 * Giup ca nhom chay thu backend ma khong can cai MongoDB.
 */
@Slf4j
@Configuration
@ConditionalOnProperty(name = "app.embedded-mongo", havingValue = "true")
public class EmbeddedMongoConfig {

    @Bean(destroyMethod = "shutdown")
    public MongoServer mongoServer() {
        // Driver MongoDB 5.x yeu cau server >= 4.2 (wire version 8) -> khai bao phien ban 4.2
        MongoVersion v42 = new MongoVersion() {
            @Override public java.util.List<Integer> getVersionArray() { return java.util.List.of(4, 2, 0); }
            @Override public int getWireVersion() { return 8; }
        };
        MongoServer server = new MongoServer(new MemoryBackend().version(v42));
        InetSocketAddress address = server.bind();
        log.warn("==> Dang dung MongoDB GIA LAP trong RAM tai {} (du lieu se mat khi tat app)", address);
        return server;
    }

    @Bean
    public MongoClient mongoClient(MongoServer server) {
        InetSocketAddress a = server.getLocalAddress();
        return MongoClients.create("mongodb://" + a.getHostString() + ":" + a.getPort());
    }
}
