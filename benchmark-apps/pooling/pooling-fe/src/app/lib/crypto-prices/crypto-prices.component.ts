import { Component, inject } from '@angular/core';
import { AsyncPipe, DecimalPipe, DatePipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { Observable } from 'rxjs';
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
    <h2>Crypto Prices (HTTP polling)</h2>

    <!-- Wskaźnik postępu -->
    <div *ngIf="collectingData" style="background: #f0f0f0; padding: 5px; margin-bottom: 10px; font-size: 0.8em; border-left: 4px solid #4CAF50;">
      <strong>TRYB POMIAROWY:</strong> Próbka {{ latencies.length }} / {{ MAX_SAMPLES }}
      <br>
      <small>Mierzę tylko faktycznie zaktualizowane rekordy.</small>
    </div>

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

  // Mapa do pamiętania ostatniego timestampu dla każdego symbolu.
  // Klucz: Symbol (np. BTC), Wartość: timestamp (ms)
  private lastSeenTimestamps = new Map<string, number>();
  // ------------------------

  // Strumień z pomiarem w 'tap'
  private prices$: Observable<Price[]> = this.api.pollPrices(1000).pipe(
    tap(prices => this.measureLatencySmart(prices))
  );

  pricesView$: Observable<PriceView[]> = this.prices$.pipe(
    scan((state: { prev: Map<string, number>; view: PriceView[] }, list: Price[]) => {
      const nextPrev = new Map(state.prev);
      const view = list.map((p): PriceView => {
        const prev = state.prev.get(p.symbol);
        const trend: Trend = prev == null ? '' : (p.price > prev ? 'up' : (p.price < prev ? 'down' : ''));
        nextPrev.set(p.symbol, p.price);
        return { ...p, trend };
      });
      return { prev: nextPrev, view };
    }, { prev: new Map<string, number>(), view: [] as PriceView[] }),
    map(s => s.view),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  now = new Date();
  constructor() { setInterval(() => this.now = new Date(), 1000); }

  trackBySymbol = (_: number, p: PriceView) => p.symbol;

  // --- INTELIGENTNA METODA POMIAROWA ---

  private measureLatencySmart(prices: Price[]): void {
    if (!this.collectingData || prices.length === 0) return;

    const receiveTime = Date.now();
    let sampleAdded = false;

    // Iterujemy po wszystkich walutach w otrzymanej odpowiedzi
    for (const p of prices) {
      const genTime = new Date(p.generatedAt).getTime();
      const lastKnownTime = this.lastSeenTimestamps.get(p.symbol) || 0;

      // Logika: Mierzymy opóźnienie TYLKO jeśli ten konkretny rekord jest nowszy
      // niż ten, który widzieliśmy poprzednio. To oznacza, że to jest "świeża" aktualizacja.
      if (genTime > lastKnownTime) {

        // Aktualizujemy wiedzę o ostatniej wersji
        this.lastSeenTimestamps.set(p.symbol, genTime);

        // Liczymy latency dla tej konkretnej aktualizacji
        const latency = receiveTime - genTime;

        // Walidacja poprawności (odrzucamy ujemne i anomalie > 60s)
        if (latency >= 0 && latency < 60000) {
          this.latencies.push(latency);
          sampleAdded = true; // Zaznaczamy, że w tym requeście coś zmierzyliśmy
        }
      }
    }

    // Sprawdzamy warunek stopu
    if (this.latencies.length >= this.MAX_SAMPLES) {
      this.collectingData = false;
      this.printStatistics();
    }
  }

  private printStatistics(): void {
    // Kopiujemy tablicę i sortujemy
    const sorted = [...this.latencies].sort((a, b) => a - b);

    // Podstawowe statystyki
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const sum = sorted.reduce((a, b) => a + b, 0);
    const avg = sum / sorted.length;

    // Mediana
    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 !== 0
      ? sorted[mid]
      : (sorted[mid - 1] + sorted[mid]) / 2;

    // Odchylenie standardowe
    const squareDiffs = this.latencies.map(value => Math.pow(value - avg, 2));
    const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length;
    const stdDev = Math.sqrt(avgSquareDiff);

    console.group('%c [WYNIKI BADAŃ - POLLING (SMART)] ', 'color: #2196F3; font-size: 14px; font-weight: bold;');
    console.log(`Liczba próbek (N): ${this.latencies.length}`);
    console.log(`Min Opóźnienie: ${min.toFixed(2)} ms`);
    console.log(`Max Opóźnienie: ${max.toFixed(2)} ms`);
    console.log(`Średnia (Avg): ${avg.toFixed(2)} ms`);
    console.log(`Mediana: ${median.toFixed(2)} ms`);
    console.log(`Odchylenie Std (σ): ${stdDev.toFixed(2)} ms`);
    console.groupEnd();

    alert(`Pomiary zakończone! Wyniki w konsoli.`);
  }
}
