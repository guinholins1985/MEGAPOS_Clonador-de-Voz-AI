export interface VoiceAnalysis {
  gender: 'Male' | 'Female' | 'Unknown';
  pitch: 'low' | 'medium' | 'high';
  emotion: string;
  vocal_style: string;
}

export interface PrebuiltVoice {
  id: string; // The ID used by the API (e.g., 'Zephyr')
  name: string; // The display name (e.g., 'Rafael')
  description: string; // A descriptive style
}
