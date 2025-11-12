// restaurace-server.js
const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
const crypto = require('crypto');
const app = express();

const SHARED_SECRET = 'tajnyKlic123';

// Uchovávání stavů objednávek
const orders = {};
let nextId = 1; // automatické ID objednávky
const processedEvents = new Set(); // pro idempotentní zpracování

// Middleware pro raw body (pro HMAC)
app.use(express.json({
    verify: (req, res, buf) => {
        req.rawBody = buf.toString('utf8');
    }
}));

// Servírování HTML
app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'index.html'));
});

// Endpoint pro webhook od kurýra s ověřením X-Signature a event_id
app.post('/update', (req, res) => {
    const sigHeader = (req.get('X-Signature') || '').trim();

    const expectedSig = crypto.createHmac('sha256', SHARED_SECRET)
                              .update(req.rawBody, 'utf8')
                              .digest('hex');

    const valid = crypto.timingSafeEqual(
        Buffer.from(sigHeader, 'hex'),
        Buffer.from(expectedSig, 'hex')
    );

    if (!valid) {
        console.log('Chybný podpis, webhook ignorován.');
        return res.status(401).send('Unauthorized');
    }

    const { id, status, event_id } = req.body;

    // Kontrola duplicitní notifikace
    if (processedEvents.has(event_id)) {
        console.log(`Duplicitní webhook, event_id ${event_id} již zpracováno.`);
        return res.sendStatus(200); // stále OK, ale zpracování přeskočeno
    }

    // Označení event_id jako zpracované
    processedEvents.add(event_id);

    // Aktualizace stavu objednávky
    console.log(`Webhook validní: ${id} -> ${status} (event_id ${event_id})`);
    orders[id] = status;

    res.sendStatus(200);
});

// Endpoint pro získání aktuálních objednávek
app.get('/orders', (req, res) => {
    res.json(orders);
});

// Endpoint pro odeslání nové objednávky kurýrovi (automatické ID)
app.post('/send-order', async (req, res) => {
    const id = nextId++;
    const order = { id, callbackUrl: 'http://localhost:3001/update' };

    try {
        const response = await fetch('http://localhost:3000/order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(order)
        });

        console.log(`Objednávka ${id} odeslána kurýrovi, status: ${response.status}`);
        res.json({ id });
    } catch (err) {
        console.error('Chyba při odesílání objednávky:', err);
        res.sendStatus(500);
    }
});

app.listen(3001, () => {
    console.log('Restaurace běží na http://localhost:3001');
});
