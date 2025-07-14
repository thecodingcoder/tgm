const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const port = 3000;

app.use(cors()); // Allow all origins (for dev purposes)
app.use(express.json()); // Parse JSON bodies

app.post('/proxy-report', async (req, res) => {
    try {
        const response = await axios.post(
            'https://dev-api.playfriends.gg/v0/games/score/report',
            req.body,
            {
                headers: {
                    'Authorization': 'ApiKey 45c2a8b4a70869e59f9dac0e396b3b345b218a69e7da6237a8f80cfaa83f10ea',
                    'Content-Type': 'application/json'
                }
            }
        );

        res.status(response.status).json(response.data);
    } catch (err) {
        console.error('Error forwarding request:', err.message);
        if (err.response) {
            res.status(err.response.status).json(err.response.data);
        } else {
            res.status(500).json({ error: 'Server error' });
        }
    }
});

app.listen(port, () => {
    console.log(`🟢 Proxy server running at http://localhost:${port}`);
});