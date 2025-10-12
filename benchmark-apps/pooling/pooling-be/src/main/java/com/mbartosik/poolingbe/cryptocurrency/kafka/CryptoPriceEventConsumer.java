package com.mbartosik.poolingbe.cryptocurrency.kafka;

import com.mbartosik.poolingbe.cryptocurrency.store.PriceStore;
import com.mbartosik.poolingbe.models.CryptoPriceEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class CryptoPriceEventConsumer {

    private final PriceStore store;

    @KafkaListener(
            topics = "${kafka.consumer.topic}",
            groupId = "${kafka.consumer.group-id}",
            containerFactory = "cryptoEventKafkaListenerContainerFactory" // albo usuń, jeśli używasz auto-config
    )
    public void consume(CryptoPriceEvent event) {
        store.put(event.symbol(), event.price());
    }
}