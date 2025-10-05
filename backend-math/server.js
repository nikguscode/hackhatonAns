const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 8081;

// Разрешаем CORS
app.use(cors());

// Увеличиваем лимит до 50MB (можно меньше, если достаточно)
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

let latestStats = {};

app.post('/api/stats', (req, res) => {
    latestStats = req.body;
    console.log("Received metrics, length:", JSON.stringify(latestStats).length);
    res.send({ status: 'ok' });
});

app.get('/api/stats/activity', (req, res) => {
    res.json({ stations: latestStats });
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
