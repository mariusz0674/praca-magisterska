import {CryptoPricesComponent} from './lib/crypto-prices/crypto-prices.component';
import {Component} from '@angular/core';

@Component({
  selector: 'app-root',
  imports: [CryptoPricesComponent],
  template: `<app-crypto-prices />`
})
export class AppComponent {}
