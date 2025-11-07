export interface VoiceAnalysis {
  gender: 'Male' | 'Female' | 'Unknown';
  pitch: 'low' | 'medium' | 'high';
  emotion: string;
  vocal_style: string;
}
