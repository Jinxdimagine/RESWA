

const express=require('express')
const fetch = require('node-fetch');
const path = require('path');
const {request, response} = require("express");
const app = express();

app.use(express.json())
// Servírování statických souborů (CSS/JS)
app.use(express.static(path.join(__dirname, 'frontend')));

//servirovani html souboru
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.get('data_formula',(req,res)=>{
    fetch()
        .then(response=>response.json())
        .then(data=>console.log(data))

});

app.post('/api/data', async(req,res)=>{
 const order = {  callbackUrl: 'http://10.2.7.58:8080/api/update' };
 try {
        const response = await fetch('http://10.2.244.131:8088/api/v1/stats/seasons/races/active/hook', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(order)
        });

        console.log(response.body);
    } catch (err) {
        console.error('Error', err);
        res.sendStatus(500);
    }

});

app.post('/api/update', async (req, res) => {

    const data = { id, callbackUrl: 'http://localhost:3001/api/update' };

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


// 1️⃣ Function to fetch data from external server
async function fetchExternalData() {
    const externalUrl = 'https://external-server.com/data';
    try {
        const response = await fetch(externalUrl);
        if (!response.ok) {
            throw new Error(`External server error: ${response.status}`);
        }
        const data = await response.json();
        return data; // return data to be used by route
    } catch (error) {
        console.error('Error fetching external data:', error);
        throw error; // rethrow to be handled by route
    }
}

// 2️⃣ Route handler for GET /api/items
app.get('/api/items', async (req, res) => {
    try {
        const data = await fetchExternalData();
        res.json(data); // send the fetched data to frontend
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch data' });
    }
});

app.listen(8080, () => {
    console.log('Server running on http://10.2.7.58:8080');
});
