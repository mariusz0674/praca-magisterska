export interface Price {
  symbol: string;
  price: number;
  /** ISO timestamp pochodzący z backendowego Instant (czas wygenerowania eventu) */
  generatedAt: string;
}
