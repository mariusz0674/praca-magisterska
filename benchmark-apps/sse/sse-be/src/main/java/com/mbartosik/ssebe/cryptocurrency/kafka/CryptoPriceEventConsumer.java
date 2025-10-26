package com.mbartosik.ssebe.cryptocurrency.kafka;

import com.mbartosik.ssebe.cryptocurrency.SseHub;
import com.mbartosik.ssebe.models.CryptoPriceEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class CryptoPriceEventConsumer {

    private final SseHub sseHub;

    @KafkaListener(
            topics = "${kafka.consumer.topic}",
            groupId = "${kafka.consumer.group-id}",
            containerFactory = "cryptoEventKafkaListenerContainerFactory"
    )
    public void consume(CryptoPriceEvent event) {
        sseHub.broadcastPrice(event);
    }
}