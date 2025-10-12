package com.mbartosik.datagenerator.producer.kafka;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "kafka")
public class KafkaConfigProperties {

    private String bootstrapServers;
    private Topic topic = new Topic();
    private Producer producer = new Producer();

    @Data
    public static class Topic {
        private String cryptoPrices;
    }

    @Data
    public static class Producer {
        private String acks = "all";
        private Integer retries = 3;
        private Integer lingerMs = 5;
        private Integer batchSize = 16_384;
        private String compressionType = "lz4";
        private String clientId = "crypto-price-producer";
    }
}