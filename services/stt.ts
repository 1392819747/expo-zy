// Simple pluggable Speech-to-Text service.
// Replace the implementation of transcribeAudio with a real API integration when available.

import * as FileSystem from 'expo-file-system/legacy';

export type STTResult = {
  text: string;
  provider?: string;
};

export async function transcribeAudio(uri: string): Promise<STTResult> {
  try {
    const info = await FileSystem.getInfoAsync(uri);
    const kb = info.exists && info.size ? Math.round((info.size / 1024) * 10) / 10 : 0;
    // Placeholder transcription result.
    // Integrate with your backend or platform STT here (e.g., OpenAI, Google, Azure, iOS SFSpeechRecognizer, etc.)
    return {
      text: `（模拟转写）这是一条约 ${kb}KB 的语音内容。`
    };
  } catch (e) {
    return { text: '转文字未配置或失败。' };
  }
}
