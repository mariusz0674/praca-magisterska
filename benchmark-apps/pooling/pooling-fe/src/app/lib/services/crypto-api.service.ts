import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { timer, Observable } from 'rxjs';
import { switchMap, map, catchError, shareReplay } from 'rxjs/operators';

export interface Price { symbol: string; price: number; }

@Injectable({ providedIn: 'root' })
export class CryptoApiService {
  // jeśli używasz proxy w Angularze, zostaw pusty prefix i dawaj ścieżki /api/...
  private readonly base = 'http://localhost:8071';

  constructor(private http: HttpClient) {}

  pollPrices(intervalMs = 1000): Observable<Price[]> {
    return timer(0, intervalMs).pipe(
      switchMap(() => this.http.get<Record<string, number>>(`${this.base}/api/crypto/prices`)),
      map(obj => Object.entries(obj || {})
        .map(([symbol, price]) => ({ symbol, price }))
        .sort((a, b) => a.symbol.localeCompare(b.symbol))
      ),
      shareReplay({ bufferSize: 1, refCount: true }),
      catchError(err => { console.error(err); return [[]] as unknown as Observable<Price[]>; })
    );
  }
}
