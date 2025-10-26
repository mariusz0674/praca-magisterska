package com.mbartosik.ssebe.models;

public record CryptoPriceEvent(
        String symbol,
        double price
) {
}

