import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    // KLUCZOWE DLA SSE:
    // Ignorujemy treść przychodzących wiadomości, żeby nie zapchać RAMu generatora.
    // Interesuje nas tylko to, że połączenie jest otwarte.
    discardResponseBodies: true,

    stages: [
        { duration: '30s', target: 500 },  // Rozgrzewka
        { duration: '90s', target: 500 },  // Stabilizacja
        { duration: '30s', target: 1000 }, // Ramp-up
        { duration: '90s', target: 1000 }, // Stabilizacja
        { duration: '30s', target: 2000 }, // Ramp-up
        { duration: '90s', target: 2000 }, // Stabilizacja
        { duration: '30s', target: 4000 }, // Atak szczytowy
        { duration: '90s', target: 4000 }, // Utrzymanie szczytu
    ],

    thresholds: {
        // Test uznajemy za oblany tylko jeśli > 1% prób połączenia się nie uda
        // (np. dostaniesz 500, 502, 503 lub connection refused)
        http_req_failed: ['rate<0.01'],

        // USUNIĘTO: http_req_duration
        // Powód: W SSE udany request trwa w nieskończoność (lub do timeoutu).
        // Wymaganie czasu <500ms spowodowałoby, że 100% poprawnych testów by "failowało".
    },
};

const BASE_URL = 'http://192.168.1.6:4203';
// Upewnij się, że to jest na pewno endpoint SSE, a nie zwykły GET JSON
const SSE_ENDPOINT = '/api/crypto/prices';

export default function () {
    const params = {
        headers: {
            'Accept': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
        // Timeout ustawiony na 180s.
        // Dzięki temu k6 będzie trzymał połączenie otwarte przez całą fazę stabilizacji (90s)
        timeout: '1h',
    };

    const res = http.get(`${BASE_URL}${SSE_ENDPOINT}`, params);

    check(res, {
        // Sprawdzamy czy serwer przyjął połączenie (200 OK)
        'status is 200': (r) => r.status === 200,
        // Sprawdzamy czy serwer faktycznie odpowiada strumieniem
        'is event-stream': (r) => r.headers['Content-Type'] && r.headers['Content-Type'].includes('text/event-stream'),
    });

    // Sleep wykonuje się tylko po zamknięciu połączenia (przez serwer lub timeout).
    // Chroni przed pętlą reconnectów w razie awarii.
    sleep(1);
}