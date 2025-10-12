package com.mbartosik.poolingbe.models;

public record CryptoPriceEvent(
        String symbol,
        double price
) {
}

