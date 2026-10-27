const { GoogleGenAI } = require('@google/genai');
const config = require('./config');
const tools = require('./tools');

const ai = new GoogleGenAI({ apiKey: config.apiKey });
const history = [];
let busy = false;

const SYSTEM = `তুমি "${config.username}", একটি Minecraft সার্ভারে থাকা বট।
- প্লেয়ার যে ভাষায় লেখে (বাংলা/ইংরেজি) সেই ভাষায় উত্তর দাও।
- উত্তর খুব ছোট রাখো (সর্বোচ্চ ১-২ বাক্য, ২০০ অক্ষরের মধ্যে), কারণ এটা Minecraft চ্যাট।
- কাজ করতে বললে টুল ব্যবহার করো, তারপর সংক্ষেপে জানাও কী করলে।
- অবস্থা জানতে হলে get_status ব্যবহার করো, অনুমান করো না।
- বন্ধুত্বপূর্ণ থাকো, কিন্তু অপ্রয়োজনীয় কথা বলো না।`;

function convert(schema) {
  if (!schema || typeof schema !== 'object') return schema;
  const out = { ...schema };
  if (out.type) out.type = String(out.type).toUpperCase();
  delete out.minimum;
  delete out.maximum;
  if (out.properties) {
    out.properties = Object.fromEntries(
      Object.entries(out.properties).map(([k, v]) => [k, convert(v)])
    );
  }
  return out;
}

const functionDeclarations = tools.definitions.map((d) => {
  const decl = { name: d.name, description: d.description };
  const props = d.input_schema.properties;
  if (props && Object.keys(props).length > 0) decl.parameters = convert(d.input_schema);
  return decl;
});

function say(bot, text) {
  const clean = text.replace(/\s+/g, ' ').trim();
  for (let i = 0; i < clean.length; i += 200) bot.chat(clean.slice(i, i + 200));
}

async function think(bot, username, message) {
  if (busy) return;
  busy = true;
  try {
    history.push({ role: 'user', parts: [{ text: `${username}: ${message}` }] });
    while (history.length > config.maxHistory) history.shift();
    while (history.length && history[0].role !== 'user') history.shift();

    const contents = [...history];
    let finalText = '';

    for (let i = 0; i < 6; i++) {
      const res = await ai.models.generateContent({
        model: config.model,
        contents,
        config: {
          systemInstruction: SYSTEM,
          tools: [{ functionDeclarations }],
          maxOutputTokens: 1024,
        },
      });

      const calls = res.functionCalls || [];
      if (calls.length === 0) {
        finalText = (res.text || '').trim();
        break;
      }

      contents.push(res.candidates[0].content);
      const parts = [];
      for (const call of calls) {
        const out = await tools.run(bot, call.name, call.args || {});
        parts.push({ functionResponse: { name: call.name, response: { result: out } } });
      }
      contents.push({ role: 'user', parts });
    }

    if (finalText) {
      history.push({ role: 'model', parts: [{ text: finalText }] });
      say(bot, finalText);
    }
  } catch (e) {
    console.error('Gemini error:', e.message);
    bot.chat('একটু সমস্যা হচ্ছে, আবার বলো।');
  } finally {
    busy = false;
  }
}

module.exports = { think };
