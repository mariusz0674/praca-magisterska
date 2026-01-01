package com.mbartosik.datagenerator.producer;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.LinkedHashMap;
import java.util.Map;

@Data
@Configuration
@ConfigurationProperties(prefix = "feed")
public class FeedConfigProperties {

    private Map<String, Double> means = new LinkedHashMap<>();

    private Map<String, Double> basePrices = new LinkedHashMap<>();

    private int maxDelayMultiplier = 10;
}