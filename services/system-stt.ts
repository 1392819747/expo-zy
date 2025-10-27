// System STT via react-native-voice (iOS: SFSpeechRecognizer, Android: SpeechRecognizer)
// This is optional. It requires installing `react-native-voice` and building the native app.
// Usage in Expo: `npx expo install react-native-voice` then EAS Build or `expo prebuild`.

let Voice: any = null;
try {
  // Dynamically require so app can run without the package installed
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Voice = require('react-native-voice');
} catch {}

let currentTranscript = '';
let listening = false;

export function isSystemSTTAvailable() {
  return !!Voice;
}

export async function requestSystemSTTAuthorization(): Promise<void> {
  if (!Voice) return;
  try {
    if (typeof Voice.requestAuthorization === 'function') {
      await Voice.requestAuthorization();
    }
  } catch {}
}

export async function startSystemSTT(locale: string = 'zh-CN') {
  if (!Voice) throw new Error('react-native-voice not installed');
  if (listening) return;
  currentTranscript = '';

  Voice.onSpeechResults = (e: any) => {
    const values: string[] = e?.value || [];
    if (values.length) {
      currentTranscript = values[values.length - 1];
    }
  };
  Voice.onSpeechError = (_e: any) => {
    // noop: errors will simply result in empty text
  };

  listening = true;
  try {
    await Voice.start(locale);
  } catch (e) {
    listening = false;
    throw e;
  }
}

export async function stopSystemSTT(): Promise<string> {
  if (!Voice) throw new Error('react-native-voice not installed');
  if (!listening) return currentTranscript;
  try {
    await Voice.stop();
  } catch {}
  listening = false;
  return currentTranscript || '';
}

export async function cancelSystemSTT() {
  if (!Voice) return;
  try {
    await Voice.cancel();
  } catch {}
  listening = false;
  currentTranscript = '';
}
