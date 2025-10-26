package com.mbartosik.ssebe.cryptocurrency;

import com.mbartosik.ssebe.models.CryptoPriceEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Slf4j
@Component
@RequiredArgsConstructor
public class SseHub {

    private final List<SseEmitter> clients = new CopyOnWriteArrayList<>();

    public SseEmitter register() {
        SseEmitter emitter = new SseEmitter(0L);
        clients.add(emitter);

        emitter.onCompletion(() -> clients.remove(emitter));
        emitter.onTimeout(() -> {
            clients.remove(emitter);
            emitter.complete();
        });
        emitter.onError(ex -> {
            clients.remove(emitter);
            log.debug("SSE error, removing client: {}", ex.toString());
        });

        try {
            emitter.send(SseEmitter.event().name("hello").data("connected"));
        } catch (IOException ignored) { }

        return emitter;
    }

    public void broadcastPrice(CryptoPriceEvent event) {
        for (SseEmitter emitter : clients) {
            try {
                emitter.send(
                        SseEmitter.event()
                                .name("price")
                                .data(event)
                );
            } catch (IOException e) {
                clients.remove(emitter);
                try { emitter.completeWithError(e); } catch (Exception ignored) {}
            }
        }
    }
}