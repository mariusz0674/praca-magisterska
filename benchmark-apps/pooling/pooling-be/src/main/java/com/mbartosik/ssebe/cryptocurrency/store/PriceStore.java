package com.mbartosik.ssebe.cryptocurrency.store;

import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class PriceStore {

    public record PriceSnapshot(double price, Instant generatedAt) {}

    private final ConcurrentHashMap<String, PriceSnapshot> latest = new ConcurrentHashMap<>();

    public void put(String symbol, double price, Instant generatedAt) {
        latest.put(symbol, new PriceSnapshot(price, generatedAt));
    }

    public Map<String, PriceSnapshot> all() {
        return Map.copyOf(latest);
    }

}