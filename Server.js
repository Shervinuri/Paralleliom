// Import necessary packages
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

// Create an Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Use CORS to allow requests from your Netlify frontend
// IMPORTANT: Later, replace '*' with your actual Netlify URL for better security
app.use(cors({ origin: 'https://paralleliom.netlify.app' }));

// Define the main proxy endpoint
app.get('/proxy', async (req, res) => {
    const targetUrl = req.query.url;

    if (!targetUrl) {
        return res.status(400).send('Error: URL parameter is missing.');
    }

    try {
        // Fetch the content from the target URL
        const response = await fetch(targetUrl, {
            headers: {
                // Mimic a real browser to avoid being blocked
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        // Get headers from the response
        const headers = { ...response.headers.raw() };

        // **CRITICAL STEP: Remove security headers that prevent embedding**
        delete headers['content-security-policy'];
        delete headers['x-frame-options'];
        delete headers['content-security-policy-report-only'];

        // Send the modified headers to the client
        res.status(response.status).set(headers);
        
        // Stream the content directly to the client
        response.body.pipe(res);

    } catch (error) {
        console.error('Proxy Error:', error);
        res.status(500).send(`Server Error: ${error.message}`);
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Proxy server is running on port ${PORT}`);
});
