package com.mbartosik.datagenerator.producer.kafka;


import com.mbartosik.datagenerator.models.CryptoPriceEvent;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.core.ProducerFactory;
import org.springframework.kafka.support.serializer.JsonSerializer;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class KafkaProducerConfig {

    @Bean
    public ProducerFactory<String, CryptoPriceEvent> producerFactory(KafkaConfigProperties props) {
        Map<String, Object> cfg = new HashMap<>();
        cfg.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, props.getBootstrapServers());
        cfg.put(ProducerConfig.ACKS_CONFIG, props.getProducer().getAcks());
        cfg.put(ProducerConfig.RETRIES_CONFIG, props.getProducer().getRetries());
        cfg.put(ProducerConfig.LINGER_MS_CONFIG, props.getProducer().getLingerMs());
        cfg.put(ProducerConfig.BATCH_SIZE_CONFIG, props.getProducer().getBatchSize());
        cfg.put(ProducerConfig.COMPRESSION_TYPE_CONFIG, props.getProducer().getCompressionType());
        cfg.put(ProducerConfig.CLIENT_ID_CONFIG, props.getProducer().getClientId());
        cfg.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        cfg.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, JsonSerializer.class);
        cfg.put(JsonSerializer.ADD_TYPE_INFO_HEADERS, false);
        return new DefaultKafkaProducerFactory<>(cfg);
    }

    @Bean
    public KafkaTemplate<String, CryptoPriceEvent> kafkaTemplate(ProducerFactory<String, CryptoPriceEvent> pf) {
        return new KafkaTemplate<>(pf);
    }
}