const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const OFFICIAL_EMAIL = process.env.OFFICIAL_EMAIL || "YOUR_CHITKARA_EMAIL@chitkara.edu.in";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Logic Helpers
const isPrime = (num) => {
    if (num < 2) return false;
    for (let i = 2; i <= Math.sqrt(num); i++) if (num % i === 0) return false;
    return true;
};

const getGcd = (a, b) => b === 0 ? a : getGcd(b, a % b);
const getLcm = (a, b) => (a * b) / getGcd(a, b);

// GET /health
app.get('/health', (req, res) => {
    res.status(200).json({
        is_success: true,
        official_email: OFFICIAL_EMAIL
    });
});

// POST /bfhl
app.post('/bfhl', async (req, res) => {
    try {
        const keys = Object.keys(req.body);
        if (keys.length !== 1) {
            return res.status(400).json({ is_success: false, message: "Provide exactly one functional key." });
        }

        const key = keys[0];
        const input = req.body[key];
        let resultData;

        switch (key) {
            case 'fibonacci':
                let n = parseInt(input);
                let fib = [0, 1];
                for (let i = 2; i < n; i++) fib.push(fib[i - 1] + fib[i - 2]);
                resultData = n <= 0 ? [] : n === 1 ? [0] : fib;
                break;

            case 'prime':
                resultData = input.filter(n => isPrime(parseInt(n)));
                break;

            case 'lcm':
                resultData = input.reduce((acc, val) => getLcm(acc, val));
                break;

            case 'hcf':
                resultData = input.reduce((acc, val) => getGcd(acc, val));
                break;

            case 'AI':
                const model = genAI.getGenerativeModel({ model: "gemini-pro" });
                const prompt = `${input}. Answer in exactly one word.`;
                const result = await model.generateContent(prompt);
                resultData = result.response.text().trim().split(' ')[0].replace(/[^\w]/g, '');
                break;

            default:
                return res.status(400).json({ is_success: false, message: "Invalid key" });
        }

        res.status(200).json({
            is_success: true,
            official_email: OFFICIAL_EMAIL,
            data: resultData
        });

    } catch (error) {
        res.status(400).json({ is_success: false, official_email: OFFICIAL_EMAIL });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));