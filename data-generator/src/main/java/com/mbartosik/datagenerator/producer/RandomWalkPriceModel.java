package com.mbartosik.datagenerator.producer;

import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

class RandomWalkPriceModel {

    private final Map<String, Double> state = new ConcurrentHashMap<>();
    private final Random rnd = new Random();

    RandomWalkPriceModel(Map<String, Double> initial) {
        state.putAll(initial);
    }

    double next(String symbol) {
        double current = state.getOrDefault(symbol, 100.0);
        double sigmaPct = switch (symbol) {
            case "BTC" -> 0.002; // 0.2%
            case "ETH" -> 0.003; // 0.3%
            default -> 0.005;    // 0.5%
        };
        double stepPct = rnd.nextGaussian() * sigmaPct;
        double next = Math.max(0.0001, current * (1.0 + stepPct));
        state.put(symbol, next);
        return roundToCents(next);
    }

    private double roundToCents(double v) {
        return Math.round(v * 100.0) / 100.0;
    }
}
