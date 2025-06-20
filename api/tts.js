const textToSpeech = require('@google-cloud/text-to-speech');

// 直接用 JSON 字符串初始化客户端（无需写临时文件）
const credentials = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
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
      voice: { languageCode: lang, ssmlGender: 'FEMALE' },
      audioConfig: { audioEncoding: 'MP3' },
    });
    if (response.audioContent) {
      res.setHeader("Content-Type", "audio/mp3");
      res.send(Buffer.from(response.audioContent, 'base64'));
    } else {
      res.status(500).send("Failed to get audio from Google TTS.");
    }
  } catch (error) {
    res.status(500).send("Error generating speech: " + (error && error.message ? error.message : JSON.stringify(error)));
  }
}; 