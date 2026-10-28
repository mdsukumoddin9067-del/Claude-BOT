process.on('uncaughtException', (e) => console.error('ERR:', e.message));
process.on('unhandledRejection', (e) => console.error('ERR:', e));

const mineflayer = require('mineflayer');
const { pathfinder } = require('mineflayer-pathfinder');
const config = require('./config');
const { setupMovements } = require('./actions');
const { think } = require('./brain');

if (!config.apiKey) {
  console.error('GEMINI_API_KEY missing');
  process.exit(1);
}

const replyAll = process.env.REPLY_ALL === 'true';
const seen = new Map();

function start() {
  const bot = mineflayer.createBot({
    host: config.host,
    port: config.port,
    username: config.username,
    version: config.version,
    auth: config.auth,
  });

  bot.loadPlugin(pathfinder);

  bot.once('spawn', () => {
    setupMovements(bot);
    console.log('Bot joined: ' + bot.username);
    bot.chat('Hello! Call my name or start with !');
  });

  const dispatch = (username, message) => {
    if (!username || username === bot.username) return;
    const key = username + message;
    const now = Date.now();
    if (seen.get(key) > now - 1500) return;
    seen.set(key, now);

    console.log('CHAT: ' + username + ': ' + message);
    if (config.owner && username !== config.owner) return;

    const called =
      replyAll ||
      message.toLowerCase().includes(bot.username.toLowerCase()) ||
      message.startsWith('!');
    if (called) think(bot, username, message);
  };

  bot.on('chat', dispatch);

  bot.on('whisper', (username, message) => {
    if (username === bot.username) return;
    console.log('WHISPER: ' + username + ': ' + message);
    if (config.owner && username !== config.owner) return;
    think(bot, username, message);
  });

  bot.on('messagestr', (msg) => {
    console.log('SERVER MSG: ' + msg);
    const m = msg.match(/^(?:<([^>]+)>|.*?([A-Za-z0-9_]{3,16})\s*[:>])\s*(.+)$/);
    if (m) dispatch(m[1] || m[2], m[3]);
  });

  bot.on('kicked', (reason) => console.log('Kicked:', JSON.stringify(reason)));
  bot.on('error', (err) => console.error('Error:', err.message));
  bot.on('end', () => {
    console.log('Disconnected, retrying in 5s...');
    setTimeout(start, 5000);
  });
}

start();
