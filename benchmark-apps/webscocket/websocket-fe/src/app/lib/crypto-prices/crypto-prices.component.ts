import { Component, inject } from '@angular/core';
import { AsyncPipe, DecimalPipe, DatePipe, NgClass, NgForOf, NgIf } from '@angular/common';
import {Observable, takeUntil, timer} from 'rxjs';
import { map, scan, shareReplay, tap } from 'rxjs/operators';
import { Price } from '../models/price';
import { CryptoApiService } from '../services/crypto-api.service';

type Trend = '' | 'up' | 'down';
type PriceView = Price & { trend: Trend };

@Component({
  selector: 'app-crypto-prices',
  standalone: true,
  imports: [AsyncPipe, NgForOf, NgIf, DecimalPipe, DatePipe, NgClass],
  styleUrls: ['./crypto-prices.component.scss'],
  template: `
    <h2>Crypto Prices (WebSocket)</h2>

    <!-- Panel pomiarowy -->
<!--    <div *ngIf="collectingData" style="background: #e8f5e9; padding: 5px; margin-bottom: 10px; font-size: 0.8em; border-left: 4px solid #4CAF50;">-->
<!--      <strong>TRYB POMIAROWY (WebSocket):</strong> Próbka {{ latencies.length }} / {{ MAX_SAMPLES }}-->
<!--      <br>-->
<!--      <small>Mierzę opóźnienie End-to-End dla protokołu STOMP/WS.</small>-->
<!--    </div>-->

    <ng-container *ngIf="pricesView$ | async as prices; else loading">
      <div *ngIf="prices.length === 0" class="empty">No data</div>
      <div class="grid" *ngIf="prices.length > 0">
        <div class="card" *ngFor="let p of prices; trackBy: trackBySymbol">
          <div class="symbol">{{ p.symbol }}</div>
          <div class="price" [ngClass]="p.trend">{{ p.price | number:'1.2-2' }}</div>
          <div class="muted">updated {{ p.generatedAt | date:"HH:mm:ss.SSS" }}</div>
        </div>
      </div>
    </ng-container>

    <ng-template #loading>
      <div class="empty">Loading…</div>
    </ng-template>
  `
})
export class CryptoPricesComponent {
  private api = inject(CryptoApiService);

  // --- LOGIKA POMIAROWA ---
  public latencies: number[] = [];
  public readonly MAX_SAMPLES = 100;
  public collectingData = true;

  // Mapa do pamiętania ostatniego timestampu (Smart Measurement)
  private lastSeenTimestamps = new Map<string, number>();
  // ------------------------

  public isStopped = false;
  private prices$: Observable<Price[]> = this.api.prices$;

  // private prices$: Observable<Price[]> = this.api.prices$.pipe(
  //   takeUntil(timer(10000)), // Po 10s wywołuje client.deactivate() w serwisie
  //   tap({
  //     complete: () => this.isStopped = true
  //   })
  // );

  // Wpinamy się z pomiarem do strumienia WebSocket
  // private prices$: Observable<Price[]> = this.api.prices$;

  // private prices$: Observable<Price[]> = this.api.prices$.pipe(
  //   tap(prices => this.measureLatencySmart(prices))
  // );

  pricesView$: Observable<PriceView[]> = this.prices$.pipe(
    scan(
      (state: { prev: Map<string, number>; view: PriceView[] }, list: Price[]) => {
        const nextPrev = new Map(state.prev);

        const view = list.map((p): PriceView => {
          const prevPrice = state.prev.get(p.symbol);

          const trend: Trend =
            prevPrice == null ? '' : (p.price > prevPrice ? 'up' : (p.price < prevPrice ? 'down' : ''));

          nextPrev.set(p.symbol, p.price);
          return { ...p, trend };
        });

        return { prev: nextPrev, view };
      },
      { prev: new Map<string, number>(), view: [] as PriceView[] }
    ),
    map(s => s.view),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  trackBySymbol = (_: number, p: PriceView) => p.symbol;

  // --- METODY POMIAROWE (Wspólne dla wszystkich wariantów) ---

  private measureLatencySmart(prices: Price[]): void {
    if (!this.collectingData || prices.length === 0) return;

    const receiveTime = Date.now();

    for (const p of prices) {
      const genTime = new Date(p.generatedAt).getTime();
      const lastKnownTime = this.lastSeenTimestamps.get(p.symbol) || 0;

      // Mierzymy tylko dla nowszych danych
      if (genTime > lastKnownTime) {
        this.lastSeenTimestamps.set(p.symbol, genTime);
        const latency = receiveTime - genTime;

        // Filtrowanie błędów
        if (latency >= 0 && latency < 60000) {
          this.latencies.push(latency);
        }
      }
    }

    if (this.latencies.length >= this.MAX_SAMPLES) {
      this.collectingData = false;
      this.printStatistics();
    }
  }

  private printStatistics(): void {
    const sorted = [...this.latencies].sort((a, b) => a - b);

    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const sum = sorted.reduce((a, b) => a + b, 0);
    const avg = sum / sorted.length;

    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 !== 0
      ? sorted[mid]
      : (sorted[mid - 1] + sorted[mid]) / 2;

    const squareDiffs = this.latencies.map(value => Math.pow(value - avg, 2));
    const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length;
    const stdDev = Math.sqrt(avgSquareDiff);

    console.group('%c [WYNIKI BADAŃ - WEBSOCKET] ', 'color: #4CAF50; font-size: 14px; font-weight: bold;');
    console.log(`Liczba próbek (N): ${this.latencies.length}`);
    console.log(`Min Opóźnienie: ${min.toFixed(2)} ms`);
    console.log(`Max Opóźnienie: ${max.toFixed(2)} ms`);
    console.log(`Średnia (Avg): ${avg.toFixed(2)} ms`);
    console.log(`Mediana: ${median.toFixed(2)} ms`);
    console.log(`Odchylenie Std (σ): ${stdDev.toFixed(2)} ms`);
    console.groupEnd();

    alert(`Pomiary WebSocket zakończone! Wyniki w konsoli.`);
  }
}
