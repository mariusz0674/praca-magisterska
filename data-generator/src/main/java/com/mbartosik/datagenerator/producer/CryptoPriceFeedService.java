package com.mbartosik.datagenerator.producer;

import com.mbartosik.datagenerator.producer.kafka.CryptoPriceProducer;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class CryptoPriceFeedService {

    private final CryptoPriceProducer producer;
    private final FeedConfigProperties cfg;

    private ScheduledExecutorService exec;
    private Random rnd;
    private RandomWalkPriceModel model;

    @PostConstruct
    public void start() {
        this.exec = Executors.newScheduledThreadPool(Math.max(1, cfg.getMeans().size()), r -> {
            Thread t = new Thread(r, "crypto-feed");
            t.setDaemon(true);
            return t;
        });
        this.rnd = new Random();
        this.model = new RandomWalkPriceModel(cfg.getBasePrices());

        for (Map.Entry<String, Double> e : cfg.getMeans().entrySet()) {
            String symbol = e.getKey();
            double meanSec = e.getValue();
            scheduleNext(symbol, meanSec, sampleExpMillis(meanSec));
        }
        log.info("CryptoPriceFeedService started. means={}, basePrices={}", cfg.getMeans(), cfg.getBasePrices());
    }

    @PreDestroy
    public void stop() {
        if (exec != null) {
            exec.shutdown();
            try {
                if (!exec.awaitTermination(5, TimeUnit.SECONDS)) {
                    exec.shutdownNow();
                }
            } catch (InterruptedException ex) {
                exec.shutdownNow();
                Thread.currentThread().interrupt();
            }
            log.info("CryptoPriceFeedService stopped");
        }
    }

    private void scheduleNext(String symbol, double meanSec, long delayMillis) {
        exec.schedule(() -> {
            try {
                double price = model.next(symbol);
                producer.sendSync(symbol, price);
                if (log.isDebugEnabled()) {
                    log.debug("sent {} price={}", symbol, price);
                }
            } catch (Exception e) {
                log.warn("send failed for {}: {}", symbol, e.toString());
            } finally {
                scheduleNext(symbol, meanSec, sampleExpMillis(meanSec));
            }
        }, delayMillis, TimeUnit.MILLISECONDS);
    }

    private long sampleExpMillis(double meanSec) {
        double u = 1.0 - rnd.nextDouble(); // (0,1]
        double seconds = -meanSec * Math.log(u);
        long ms = (long) Math.max(1, Math.round(seconds * 1000.0));
        long maxMs = Duration.ofSeconds((long) (meanSec * cfg.getMaxDelayMultiplier())).toMillis();
        return Math.min(ms, Math.max(1, maxMs));
    }
}
