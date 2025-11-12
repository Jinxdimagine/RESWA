// kuryr.js
const express = require('express');
const fetch = require('node-fetch'); // pokud používáš node-fetch 3+, použij import
const app = express();

app.use(express.json());

app.post('/order', (req, res) => {
    const order = req.body;
    console.log(`Kurýr přijmul objednávku: ${order.id}`);
    console.log('Callback URL:', order.callbackUrl);

    // Okamžité potvrzení přijetí
    res.sendStatus(202);

    // Funkce pro odeslání stavu
    const sendStatus = (status, delay) => {
        setTimeout(async () => {
            try {
                const response = await fetch(order.callbackUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: order.id, status })
                });
                console.log(`Kurýr: stav '${status}' odeslán pro objednávku ${order.id}, response: ${response.status}`);
            } catch (err) {
                console.error(`Kurýr: chyba při odesílání stavu '${status}' pro objednávku ${order.id}:`, err);
            }
        }, delay);
    };

    // Naplánování stavů: 5s, 10s, 15s
    sendStatus('Restaurace připravuje', 5000);
    sendStatus('Rozváží se', 10000);
    sendStatus('Doručeno', 15000);
});

app.listen(3000, () => {
    console.log('Kurýr běží na http://localhost:3000');
});
