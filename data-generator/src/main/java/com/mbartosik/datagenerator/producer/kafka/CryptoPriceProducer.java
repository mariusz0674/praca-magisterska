package com.mbartosik.datagenerator.producer.kafka;

import com.mbartosik.datagenerator.models.CryptoPriceEvent;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class CryptoPriceProducer {

    private final KafkaTemplate<String, CryptoPriceEvent> kafkaTemplate;
    private final KafkaConfigProperties props;

    public CryptoPriceProducer(KafkaTemplate<String, CryptoPriceEvent> kafkaTemplate,
                               KafkaConfigProperties props) {
        this.kafkaTemplate = kafkaTemplate;
        this.props = props;
    }

    public SendResult<String, CryptoPriceEvent> sendSync(String symbol, double price) {
        try {
            var event = new CryptoPriceEvent(symbol, price, Instant.now());
            return kafkaTemplate
                    .send(props.getTopic().getCryptoPrices(), symbol, event)
                    .get();
        } catch (Exception e) {
            throw new RuntimeException("Kafka send failed for symbol=" + symbol, e);
        }
    }
}