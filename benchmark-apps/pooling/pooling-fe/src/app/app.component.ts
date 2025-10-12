import { Component, signal } from '@angular/core';
import {CryptoPricesComponent} from './lib/crypto-prices/crypto-prices.component';

@Component({
  selector: 'app-root',
  imports: [CryptoPricesComponent],
  template: `<app-crypto-prices />`
})
export class AppComponent {}
