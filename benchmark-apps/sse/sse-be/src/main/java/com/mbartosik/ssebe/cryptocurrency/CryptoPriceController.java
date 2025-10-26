package com.mbartosik.ssebe.cryptocurrency;

import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;


@RestController
@RequestMapping("/api/crypto")
@RequiredArgsConstructor
public class CryptoPriceController {

    private final SseHub sseHub;

    @GetMapping(path ="/prices", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream() {
        return sseHub.register();
    }
}
