// Placeholder for Text-to-Speech (TTS) integration.
// Later you can implement with Expo Speech, platform TTS, or a cloud TTS.

export type TTSOptions = {
  language?: string; // e.g. 'zh-CN'
  pitch?: number;    // 0.5 ~ 2.0
  rate?: number;     // 0.1 ~ 1.0
  voice?: string;    // platform specific voice id/name
};

export async function speak(_text: string, _opts: TTSOptions = {}): Promise<void> {
  // No-op placeholder. Replace with a real TTS implementation.
  // Example with expo-speech (after install):
  //   import * as Speech from 'expo-speech';
  //   Speech.speak(text, { language: opts.language, pitch: opts.pitch, rate: opts.rate });
  return;
}

export async function stop(): Promise<void> {
  // Example (expo-speech): Speech.stop();
  return;
}

export async function isAvailable(): Promise<boolean> {
  // You can probe availability when integrating real TTS.
  return false;
}

