package com.mbartosik.websocketbe.models;

public record CryptoPriceEvent(
        String symbol,
        double price
) {
}

