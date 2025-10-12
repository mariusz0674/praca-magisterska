package com.mbartosik.datagenerator.models;

public record CryptoPriceEvent(
        String symbol,
        double price
) {
}

