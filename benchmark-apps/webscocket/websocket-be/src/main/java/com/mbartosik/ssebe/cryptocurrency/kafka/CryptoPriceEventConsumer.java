package com.mbartosik.ssebe.cryptocurrency.kafka;

import com.mbartosik.ssebe.models.CryptoPriceEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class CryptoPriceEventConsumer {

    private final SimpMessagingTemplate messaging;

    @KafkaListener(
            topics = "${kafka.consumer.topic}",
            groupId = "${kafka.consumer.group-id}",
            containerFactory = "cryptoEventKafkaListenerContainerFactory"
    )
    public void consume(CryptoPriceEvent event) {

        messaging.convertAndSend("/api/crypto/prices", event);
    }
}