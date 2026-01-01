import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, map, shareReplay } from 'rxjs';
import { Price } from '../models/price';

@Injectable({ providedIn: 'root' })
export class CryptoApiService implements OnDestroy {
  private readonly base = 'http://localhost:8073';
  private es?: EventSource;

  private state$ = new BehaviorSubject<Map<string, Price>>(new Map());

  prices$: Observable<Price[]> = this.state$.pipe(
    map(m =>
      Array.from(m.values())
        .slice()
        .sort((a, b) => a.symbol.localeCompare(b.symbol))
    ),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  constructor(private zone: NgZone) {
    this.es = new EventSource(`${this.base}/api/crypto/prices`);

    this.es.addEventListener('price', (e: MessageEvent) => {
      this.zone.run(() => {
        const evt = JSON.parse(e.data) as Price;
        const next = new Map(this.state$.value);
        next.set(evt.symbol, evt);
        this.state$.next(next);
      });
    });

    this.es.onerror = (err) => {
      console.error('[SSE] error', err);
    };
  }

  ngOnDestroy(): void {
    this.es?.close();
  }
}
