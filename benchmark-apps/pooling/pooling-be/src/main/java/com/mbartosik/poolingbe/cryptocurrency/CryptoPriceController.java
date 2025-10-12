package com.mbartosik.poolingbe.cryptocurrency;


import com.mbartosik.poolingbe.cryptocurrency.store.PriceStore;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
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
