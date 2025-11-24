// utils/groqClient.js
const axios = require("axios");

const groqClient = axios.create({
  baseURL: process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
  },
});

module.exports = groqClient;
