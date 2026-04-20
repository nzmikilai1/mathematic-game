import { Audio } from 'expo-av';

let soundsLoaded = false;
const sounds: Record<string, Audio.Sound> = {};
let soundsEnabled = true;

const SOUND_URLS: Record<string, string> = {
  correct: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3',
  incorrect: 'https://assets.mixkit.co/active_storage/sfx/4386/4386-preview.mp3',
  button: 'https://assets.mixkit.co/active_storage/sfx/2597/2597-preview.mp3',
  gameStart: 'https://assets.mixkit.co/active_storage/sfx/2941/2941-preview.mp3',
  gameEnd: 'https://assets.mixkit.co/active_storage/sfx/2960/2960-preview.mp3',
  starEarn: 'https://assets.mixkit.co/active_storage/sfx/2737/2737-preview.mp3',
};

export async function initializeAudio() {
  if (soundsLoaded) return;
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    });
    soundsLoaded = true;
  } catch (err) {
    console.error('Failed to initialize audio:', err);
  }
}

export async function loadSounds() {
  if (Object.keys(sounds).length > 0) return;
  try {
    for (const [key, url] of Object.entries(SOUND_URLS)) {
      try {
        const { sound } = await Audio.Sound.createAsync({ uri: url });
        sounds[key] = sound;
      } catch (err) {
        console.warn(`Failed to load sound ${key}:`, err);
      }
    }
  } catch (err) {
    console.error('Failed to load sounds:', err);
  }
}

export async function playSound(soundKey: keyof typeof SOUND_URLS) {
  if (!soundsEnabled || !sounds[soundKey]) return;
  try {
    await sounds[soundKey].setPositionAsync(0);
    await sounds[soundKey].playAsync();
  } catch (err) {
    console.warn(`Failed to play sound ${soundKey}:`, err);
  }
}

export function setSoundsEnabled(enabled: boolean) {
  soundsEnabled = enabled;
}

export function areSoundsEnabled() {
  return soundsEnabled;
}

export async function unloadSounds() {
  try {
    for (const sound of Object.values(sounds)) {
      await sound.unloadAsync();
    }
    Object.keys(sounds).forEach((k) => delete sounds[k]);
  } catch (err) {
    console.error('Failed to unload sounds:', err);
  }
}
