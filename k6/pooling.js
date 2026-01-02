import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
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
};

export default function () {
    http.get('http://192.168.1.6:4201/api/crypto/prices');
    sleep(1);
}
