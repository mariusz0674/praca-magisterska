package com.mbartosik.poolingbe.cryptocurrency.store;

import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class PriceStore {
    private final ConcurrentHashMap<String, Double> latest = new ConcurrentHashMap<>();

    public void put(String symbol, double price) {
        latest.put(symbol, price);
    }

    public Map<String, Double> all() {
        return Map.copyOf(latest);
    }

}