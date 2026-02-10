const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

// Configs from Environment Variables
const OFFICIAL_EMAIL = process.env.OFFICIAL_EMAIL || "priyal0857.be23@chitkara.edu.in";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- Logic Helpers ---
const isPrime = (num) => {
    if (num < 2) return false;
    for (let i = 2; i <= Math.sqrt(num); i++) if (num % i === 0) return false;
    return true;
};

const getGcd = (a, b) => b === 0 ? a : getGcd(b, a % b);
const getLcm = (a, b) => (a * b) / (getGcd(a, b) || 1); // Avoid division by zero

// --- Endpoints ---

// 1. GET /bfhl (Standard Bajaj Requirement)
app.get('/bfhl', (req, res) => {
    res.status(200).json({
        "operation_code": 1
    });
});

// 2. GET /health (For testing)
app.get('/health', (req, res) => {
    res.status(200).json({
        is_success: true,
        official_email: OFFICIAL_EMAIL
    });
});

// 3. POST /bfhl (Main Logic)
app.post('/bfhl', async (req, res) => {
    try {
        const body = req.body;
        let resultData;

        // Validation: Check if body is empty
        if (!body || Object.keys(body).length === 0) {
            return res.status(400).json({ is_success: false, message: "Empty request body" });
        }

        // Logic Switch based on key
        if (body.AI) {
            // AI Logic using Gemini 1.5 Flash (Faster for Vercel)
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const prompt = `${body.AI}. Answer in exactly one word.`;
            const result = await model.generateContent(prompt);
            const response = await result.response;
            // Clean up AI text to get only the first word
            resultData = response.text().trim().split(' ')[0].replace(/[^\w]/g, '');
        } 
        else if (body.fibonacci) {
            let n = parseInt(body.fibonacci);
            let fib = [0, 1];
            for (let i = 2; i < n; i++) fib.push(fib[i - 1] + fib[i - 2]);
            resultData = n <= 0 ? [] : n === 1 ? [0] : fib;
        } 
        else if (body.prime && Array.isArray(body.prime)) {
            resultData = body.prime.filter(n => isPrime(parseInt(n)));
        } 
        else if (body.lcm && Array.isArray(body.lcm)) {
            resultData = body.lcm.reduce((acc, val) => getLcm(Number(acc), Number(val)));
        } 
        else if (body.hcf && Array.isArray(body.hcf)) {
            resultData = body.hcf.reduce((acc, val) => getGcd(Number(acc), Number(val)));
        } 
        else {
            return res.status(400).json({ is_success: false, message: "No valid functional key found (AI, prime, fibonacci, lcm, or hcf)" });
        }

        // Success Response
        res.status(200).json({
            is_success: true,
            official_email: OFFICIAL_EMAIL,
            data: resultData
        });

    } catch (error) {
        console.error("Error details:", error);
        res.status(500).json({ 
            is_success: false, 
            message: "Internal Server Error",
            error: error.message 
        });
    }
});

// --- Server & Exports ---

// Required for Vercel
module.exports = app;

// Local testing
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}