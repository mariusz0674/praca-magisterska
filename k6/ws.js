import ws from 'k6/ws';
import { check, sleep } from 'k6';

export const options = {
    // Stages dla pełnego testu
    stages: [
        { duration: '30s', target: 500 },
        { duration: '90s', target: 500 },
        { duration: '30s', target: 1000 },
        { duration: '90s', target: 1000 },
        { duration: '30s', target: 2000 },
        { duration: '90s', target: 2000 },
        { duration: '30s', target: 4000 },
        { duration: '90s', target: 4000 },
    ],
};

const URL = 'ws://192.168.1.6:4202/ws';

// POPRAWNY TEMAT (zgodny z Twoim browserem)
const STOMP_TOPIC = '/api/crypto/prices';

export default function () {
    const params = { tags: { my_tag: 'stomp_test' } };

    const res = ws.connect(URL, params, function (socket) {

        socket.on('open', function open() {
            // 1. Logowanie do STOMP
            const connectFrame = "CONNECT\naccept-version:1.1,1.0\nheart-beat:10000,10000\n\n\u0000";
            socket.send(connectFrame);
        });

        socket.on('message', function (message) {
            // 2. Jeśli zalogowano -> Subskrybuj
            if (message.includes('CONNECTED')) {
                const subscribeFrame =
                    "SUBSCRIBE\n" +
                    "id:sub-0\n" +
                    "destination:" + STOMP_TOPIC + "\n" +
                    "\n" +
                    "\u0000";

                socket.send(subscribeFrame);
            }

            // Tutaj normalnie przychodzą wiadomości z cenami (MESSAGE).
            // Ponieważ handler jest pusty (poza ifem wyżej), k6 ignoruje treść
            // i nie zapycha pamięci RAM. To jest odpowiednik "discardResponseBodies".
        });

        socket.on('error', function (e) {
            // Możesz odkomentować w razie problemów, ale przy 4000 userów lepiej trzymać cicho
            // console.log('Error: ' + e.error());
        });

        // 3. Trzymaj połączenie przez godzinę
        socket.setTimeout(function () {
            socket.close();
        }, 3600000);
    });

    check(res, { 'status is 101': (r) => r && r.status === 101 });
    sleep(1);
}
