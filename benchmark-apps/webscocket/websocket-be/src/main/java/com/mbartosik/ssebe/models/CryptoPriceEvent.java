package com.mbartosik.ssebe.models;

import java.time.Instant;

public record CryptoPriceEvent(
        String symbol,
        double price,
        Instant generatedAt
) {
}
