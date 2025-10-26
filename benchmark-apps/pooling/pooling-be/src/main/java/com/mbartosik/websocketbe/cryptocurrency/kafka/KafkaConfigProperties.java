package com.mbartosik.websocketbe.cryptocurrency.kafka;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "kafka.consumer")
public class KafkaConfigProperties {

    private String bootstrapServers;
    private String groupId;
    private String topic;
}
