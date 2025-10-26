import {Injectable, OnDestroy} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {timer, Observable, BehaviorSubject} from 'rxjs';
import { switchMap, map, catchError, shareReplay } from 'rxjs/operators';
import {Client, IMessage} from '@stomp/stompjs';

export interface Price { symbol: string; price: number; }

@Injectable({ providedIn: 'root' })
export class CryptoApiService implements OnDestroy {
  private readonly brokerURL = 'ws://localhost:8072/ws';

  private client = new Client({
    brokerURL: this.brokerURL,
    reconnectDelay: 5000,
    debug: () => {}
  });

  private state$ = new BehaviorSubject<Map<string, number>>(new Map());

  prices$: Observable<Price[]> = this.state$.asObservable().pipe(
    map(mapState =>
      Array.from(mapState.entries())
        .map(([symbol, price]) => ({ symbol, price }))
        .sort((a, b) => a.symbol.localeCompare(b.symbol))
    ),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  constructor() {
    this.client.onConnect = () => {
      this.client.subscribe('/api/crypto/prices', (msg: IMessage) => {
        const event = JSON.parse(msg.body) as Price;
        // update stanu
        const next = new Map(this.state$.value);
        next.set(event.symbol, event.price);
        this.state$.next(next);
      });
    };

    this.client.onStompError = (frame) => {
      console.error('STOMP error:', frame.headers['message'], frame.body);
    };

    this.client.onWebSocketError = (evt) => {
      console.error('WS error:', evt);
    };

    this.client.activate();
  }

  ngOnDestroy(): void {
    void this.client.deactivate();
  }
}
