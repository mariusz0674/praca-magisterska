package com.mbartosik.ssebe.cryptocurrency.kafka;

import com.mbartosik.ssebe.models.CryptoPriceEvent;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.core.ConsumerFactory;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
import org.springframework.kafka.support.serializer.ErrorHandlingDeserializer;
import org.springframework.kafka.support.serializer.JsonDeserializer;

import java.util.HashMap;
import java.util.Map;


@Configuration
public class KafkaConsumerConfig {

    private final KafkaConfigProperties props;

    public KafkaConsumerConfig(KafkaConfigProperties props) {
        this.props = props;
    }

    @Bean
    public ConsumerFactory<String, CryptoPriceEvent> cryptoEventConsumerFactory(KafkaConfigProperties props) {
        Map<String, Object> cfg = new HashMap<>();
        cfg.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, props.getBootstrapServers());
        cfg.put(ConsumerConfig.GROUP_ID_CONFIG, props.getGroupId());
        cfg.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");

        // wrapper:
        cfg.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        cfg.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, ErrorHandlingDeserializer.class);

        // delegat do JSON:
        cfg.put(ErrorHandlingDeserializer.VALUE_DESERIALIZER_CLASS, JsonDeserializer.class.getName());
        cfg.put(JsonDeserializer.VALUE_DEFAULT_TYPE, com.mbartosik.ssebe.models.CryptoPriceEvent.class.getName());
        cfg.put(JsonDeserializer.USE_TYPE_INFO_HEADERS, false);
        cfg.put(JsonDeserializer.TRUSTED_PACKAGES, "*");

        return new DefaultKafkaConsumerFactory<>(cfg);
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, CryptoPriceEvent> cryptoEventKafkaListenerContainerFactory(
            ConsumerFactory<String, CryptoPriceEvent> cf) {
        var f = new ConcurrentKafkaListenerContainerFactory<String, CryptoPriceEvent>();
        f.setConsumerFactory(cf);
        f.setConcurrency(1);
        return f;
    }
}
