import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { timer, Observable, of } from 'rxjs';
import { switchMap, map, catchError, shareReplay } from 'rxjs/operators';
import { Price } from '../models/price';

type PriceSnapshot = { price: number; generatedAt: string };

type PricesResponse = Record<string, PriceSnapshot>;

@Injectable({ providedIn: 'root' })
export class CryptoApiService {
  constructor(private http: HttpClient) {}

  pollPrices(intervalMs = 1000): Observable<Price[]> {
    return timer(0, intervalMs).pipe(
      switchMap(() => this.http.get<PricesResponse>(`/api/crypto/prices`)),
      map(obj => Object.entries(obj || {})
        .map(([symbol, snap]) => ({ symbol, price: snap.price, generatedAt: snap.generatedAt }))
        .sort((a, b) => a.symbol.localeCompare(b.symbol))
      ),
      shareReplay({ bufferSize: 1, refCount: true }),
      catchError(err => { console.error(err); return of([] as Price[]); })
    );
  }
}
