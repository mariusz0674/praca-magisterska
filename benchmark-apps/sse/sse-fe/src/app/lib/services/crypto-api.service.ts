import { Injectable, NgZone } from '@angular/core';
import { Observable, scan, map, shareReplay } from 'rxjs';
import { Price } from '../models/price';

@Injectable({ providedIn: 'root' })
export class CryptoApiService {

  // Strumień, który otwiera połączenie przy subskrypcji i zamyka przy jej braku
  prices$: Observable<Price[]> = new Observable<Price>((observer) => {

    // 1. Otwarcie połączenia (dopiero gdy ktoś zasubskrybuje)
    const es = new EventSource(`/api/crypto/prices`);

    es.addEventListener('price', (e: MessageEvent) => {
      this.zone.run(() => {
        try {
          const evt = JSON.parse(e.data) as Price;
          observer.next(evt);
        } catch (err) {
          observer.error(err);
        }
      });
    });

    es.onerror = (err) => {
      // EventSource często rzuca błędem przy zamykaniu, można to ignorować lub logować
      // observer.error(err);
      console.log('SSE stream state:', es.readyState);
    };

    // 2. Funkcja czyszcząca (TEARDOWN) - wywoła się, gdy zrobisz unsubscribe/takeUntil
    return () => {
      console.log('Zamykanie połączenia SSE...');
      es.close();
    };
  }).pipe(
    // Agregacja pojedynczych eventów w tablicę (tak jak miałeś wcześniej)
    scan((acc, curr) => {
      acc.set(curr.symbol, curr);
      return acc;
    }, new Map<string, Price>()),
    map(m => Array.from(m.values()).sort((a, b) => a.symbol.localeCompare(b.symbol))),

    // refCount: true jest KLUCZOWE. Gdy liczba subskrybentów spadnie do 0, uruchomi się teardown (es.close)
    shareReplay({ bufferSize: 1, refCount: true })
  );

  constructor(private zone: NgZone) {}
}
