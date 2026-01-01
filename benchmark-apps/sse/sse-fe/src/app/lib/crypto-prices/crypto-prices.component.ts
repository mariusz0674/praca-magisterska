import { Component, inject } from '@angular/core';
import { AsyncPipe, DecimalPipe, DatePipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { Observable } from 'rxjs';
import { map, scan, shareReplay } from 'rxjs/operators';
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
    <h2>Crypto Prices (SSE)</h2>

    <ng-container *ngIf="pricesView$ | async as prices; else loading">
      <div *ngIf="prices.length === 0" class="empty">No data</div>
      <div class="grid" *ngIf="prices.length > 0">
        <div class="card" *ngFor="let p of prices; trackBy: trackBySymbol">
          <div class="symbol">{{ p.symbol }}</div>
          <div class="price" [ngClass]="p.trend">{{ p.price | number:'1.2-2' }}</div>
          <div class="muted">updated {{ p.generatedAt | date:"yyyy-MM-dd HH:mm:ss.SSS Z" }}</div>
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

  private prices$: Observable<Price[]> = this.api.prices$;

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
}
