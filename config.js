require('dotenv').config();

module.exports = {
  host: process.env.MC_HOST || 'localhost',
  port: parseInt(process.env.MC_PORT || '25565', 10),
  username: process.env.MC_USERNAME || 'GeminiBot',
  version: process.env.MC_VERSION || undefined,
  auth: process.env.MC_AUTH || 'offline',
  apiKey: process.env.GEMINI_API_KEY,
  model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  owner: process.env.OWNER_NAME || '',
  maxHistory: 20,
};
