const { Client } = require("tencentcloud-sdk-nodejs/tencentcloud/services/tts/v20190823/tts_client");
const { ClientConfig } = require("tencentcloud-sdk-nodejs/tencentcloud/common/interface");

// 确保环境变量已在 Vercel 配置
const secretId = process.env.TENCENTCLOUD_SECRET_ID;
const secretKey = process.env.TENCENTCLOUD_SECRET_KEY;

const clientConfig = {
  credential: {
    secretId: secretId,
    secretKey: secretKey,
  },
  region: "ap-shanghai", // 腾讯云语音合成支持的区域，你可以根据需要调整
  profile: {
    httpProfile: {
      endpoint: "tts.tencentcloudapi.com",
    },
  },
};

// 腾讯云 TTS 支持的语音模型和语言映射
const VOICE_MAP = {
  "zh-CN": "zh-CN", // 中文普通话，默认通用音色
  "en-US": "en-US", // 英文，默认通用音色
};

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const { text, lang } = req.body;

  if (!text || !lang) {
    return res.status(400).send("Missing text or language");
  }

  if (!secretId || !secretKey) {
    console.error("Tencent Cloud SecretId or SecretKey not set.");
    return res.status(500).send("Server configuration error");
  }

  const client = new Client(clientConfig);

  try {
    const response = await client.TextToSpeech({ 
      Text: text,
      Codec: "mp3", // 音频编码格式，支持 mp3, pcm
      SampleRate: 16000, // 音频采样率，支持 16000, 8000
      VoiceType: 1010000000, // 默认男声，你可以根据腾讯云文档选择其他音色
      // SessionId: "", // 可选，用于唯一标识请求
      Volume: 1, // 音量，范围 [0, 10]
      Speed: 0, // 语速，范围 [-2, 2]，负数为慢，正数为快
      PrimaryLanguage: VOICE_MAP[lang], // 主语言
      // ProjectId: 0, // 默认 0
      // ModelType: 0, // 默认 0
    });

    if (response.Audio) {
      // 返回 Base64 编码的音频数据
      const audioBuffer = Buffer.from(response.Audio, "base64");
      res.setHeader("Content-Type", "audio/mpeg"); // mp3 格式
      res.setHeader("Content-Length", audioBuffer.length);
      res.send(audioBuffer);
    } else {
      console.error("Tencent Cloud TTS API returned no audio.", response);
      res.status(500).send("Failed to get audio from Tencent Cloud.");
    }
  } catch (error) { // 捕获错误时不需要 : any
    console.error("Error calling Tencent Cloud TTS API:", error.message);
    res.status(500).send("Error generating speech: " + error.message);
  }
}; 