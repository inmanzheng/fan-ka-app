const { Client } = require("tencentcloud-sdk-nodejs/tencentcloud/services/tts/v20190823/tts_client");
const { ClientConfig } = require("tencentcloud-sdk-nodejs/tencentcloud/common/interface");

const secretId = process.env.TENCENTCLOUD_SECRET_ID;
const secretKey = process.env.TENCENTCLOUD_SECRET_KEY;

const clientConfig = {
  credential: { secretId, secretKey },
  region: "ap-shanghai",
  profile: { httpProfile: { endpoint: "tts.tencentcloudapi.com" } }
};

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");
  const { text, lang } = req.body;
  if (!text || !lang) return res.status(400).send("Missing text or language");
  if (!secretId || !secretKey) return res.status(500).send("Server configuration error");

  const client = new Client(clientConfig);
  try {
    const response = await client.TextToSpeech({
      Text: text,
      Codec: "mp3",
      SampleRate: 16000,
      VoiceType: 1010000000,
      Volume: 1,
      Speed: 0,
      PrimaryLanguage: lang === "en-US" ? "en-US" : "zh-CN"
    });
    if (response.Audio) {
      const audioBuffer = Buffer.from(response.Audio, "base64");
      res.setHeader("Content-Type", "audio/mpeg");
      res.setHeader("Content-Length", audioBuffer.length);
      res.send(audioBuffer);
    } else {
      res.status(500).send("Failed to get audio from Tencent Cloud.");
    }
  } catch (error) {
    res.status(500).send("Error generating speech: " + (error && error.message ? error.message : JSON.stringify(error)));
  }
}; 