package com.mbartosik.websocketbe.cryptocurrency;


import com.mbartosik.websocketbe.cryptocurrency.store.PriceStore;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/crypto")
@RequiredArgsConstructor
public class CryptoPriceController {

    private final PriceStore store;

    @GetMapping("/prices")
    public Map<String, Double> getAll() {
        return store.all();
    }

}
