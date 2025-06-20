const textToSpeech = require('@google-cloud/text-to-speech');

// 读取 Vercel 环境变量中的 JSON 内容
const credentials = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

// 初始化 Google TTS 客户端
const client = new textToSpeech.TextToSpeechClient({
  credentials: credentials ? JSON.parse(credentials) : undefined
});

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");
  const { text, lang } = req.body;
  if (!text || !lang) return res.status(400).send("Missing text or language");

  try {
    const [response] = await client.synthesizeSpeech({
      input: { text },
      voice: {
        languageCode: lang,
        ssmlGender: 'NEUTRAL',
      },
      audioConfig: { audioEncoding: 'MP3' },
    });
    if (response.audioContent) {
      res.setHeader("Content-Type", "audio/mpeg");
      res.send(Buffer.from(response.audioContent, 'base64'));
    } else {
      res.status(500).send("Failed to get audio from Google TTS.");
    }
  } catch (error) {
    res.status(500).send("Error generating speech: " + (error && error.message ? error.message : JSON.stringify(error)));
  }
}; 