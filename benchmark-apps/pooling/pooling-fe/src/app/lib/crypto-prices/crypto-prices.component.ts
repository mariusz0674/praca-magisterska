import { Component, inject } from '@angular/core';
import { AsyncPipe, DecimalPipe, DatePipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { Observable } from 'rxjs';
import { map, scan, shareReplay } from 'rxjs/operators';
import { Price } from '../models/price';
import {CryptoApiService} from '../services/crypto-api.service';

type Trend = '' | 'up' | 'down';
type PriceView = Price & { trend: Trend };

@Component({
  selector: 'app-crypto-prices',
  standalone: true,
  imports: [AsyncPipe, NgForOf, NgIf, DecimalPipe, DatePipe, NgClass],
  styles: [`
    :host { display:block; max-width:960px; margin:24px auto; padding:0 16px; color:#e6eef8; }
    h2 { margin:0 0 12px; font-size:20px; }
    .grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap:12px; }
    .card { background:#121823; border:1px solid #1f2733; border-radius:12px; padding:12px 14px; min-height:86px; display:flex; flex-direction:column; justify-content:center; }
    .symbol { font-weight:700; letter-spacing:0.5px; color:#9fb1c7; }
    .price { font-size:22px; line-height:1.2; }
    .up { color:#7dff9c; }
    .down { color:#ff7d7d; }
    .muted { color:#9fb1c7; font-size:12px; margin-top:6px; }
    .empty { color:#9fb1c7; text-align:center; padding:24px; border:1px dashed #1f2733; border-radius:12px; }
  `],
  template: `
    <h2>Crypto Prices (HTTP polling)</h2>

    <ng-container *ngIf="pricesView$ | async as prices; else loading">
      <div *ngIf="prices.length === 0" class="empty">No data</div>
      <div class="grid" *ngIf="prices.length > 0">
        <div class="card" *ngFor="let p of prices; trackBy: trackBySymbol">
          <div class="symbol">{{ p.symbol }}</div>
          <div class="price" [ngClass]="p.trend">{{ p.price | number:'1.2-2' }}</div>
          <div class="muted">updated {{ now | date:'mediumTime' }}</div>
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

  // surowe ceny z backendu
  private prices$: Observable<Price[]> = this.api.pollPrices(1000);

  // ceny z obliczonym trendem (bez efektów ubocznych w template)
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
}
