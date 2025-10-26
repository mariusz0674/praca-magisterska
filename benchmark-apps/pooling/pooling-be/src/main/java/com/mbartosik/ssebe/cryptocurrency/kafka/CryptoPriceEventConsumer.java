package com.mbartosik.ssebe.cryptocurrency.kafka;

import com.mbartosik.ssebe.cryptocurrency.store.PriceStore;
import com.mbartosik.ssebe.models.CryptoPriceEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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