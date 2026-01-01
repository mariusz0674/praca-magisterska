import { Injectable, NgZone } from '@angular/core';
import { Observable, scan, map, shareReplay } from 'rxjs';
import { Client, IMessage } from '@stomp/stompjs';
import { Price } from '../models/price';

@Injectable({ providedIn: 'root' })
export class CryptoApiService {
  private readonly brokerURL = 'ws://localhost:8072/ws'; // Sprawdź port!

  // Strumień on-demand: Otwiera WS przy subskrypcji, zamyka przy unsubscribe.
  prices$: Observable<Price[]> = new Observable<Price>((observer) => {

    // 1. Konfiguracja klienta STOMP (per subskrypcja)
    const client = new Client({
      brokerURL: this.brokerURL,
      reconnectDelay: 0, // Wyłączamy reconnect dla testów, żeby nie śmiecił po zamknięciu
      debug: (str) => console.debug('[STOMP]', str)
    });

    client.onConnect = () => {
      // Po połączeniu od razu subskrybujemy temat
      client.subscribe('/api/crypto/prices', (msg: IMessage) => {
        // Ponieważ STOMP callback jest poza Angular Zone, wracamy do niej
        this.zone.run(() => {
          try {
            const event = JSON.parse(msg.body) as Price;
            observer.next(event);
          } catch (err) {
            observer.error(err);
          }
        });
      });
    };

    client.onStompError = (frame) => {
      console.error('STOMP error:', frame);
      observer.error(frame);
    };

    client.onWebSocketError = (evt) => {
      console.error('WS error:', evt);
      // observer.error(evt);
    };

    // 2. Aktywacja połączenia
    client.activate();

    // 3. TEARDOWN: Zamykamy WS przy unsubscribe
    return () => {
      console.log('Dezaktywacja klienta STOMP...');
      void client.deactivate();
    };
  }).pipe(
    // Agregacja eventów (Scan)
    scan((acc, curr) => {
      acc.set(curr.symbol, curr);
      return acc;
    }, new Map<string, Price>()),

    // Sortowanie
    map(m => Array.from(m.values()).sort((a, b) => a.symbol.localeCompare(b.symbol))),

    // Kluczowe: refCount utrzymuje połączenie tylko gdy są subskrybenci
    shareReplay({ bufferSize: 1, refCount: true })
  );

  constructor(private zone: NgZone) {}
}
