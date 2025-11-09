import { GoogleGenAI, Modality, Type } from "@google/genai";
import type { VoiceAnalysis } from './types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

/**
 * Converts a File object to a base64 encoded string.
 * @param file The file to convert.
 * @returns A promise that resolves with the base64 string.
 */
function fileToGenerativePart(file: File): Promise<{ inlineData: { data: string; mimeType: string; } }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result !== 'string') {
        return reject(new Error("Falha ao ler o arquivo como string base64."));
      }
      // Extracts base64 data from data URI
      const base64Data = reader.result.split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Transcribes audio and analyzes the speaker's voice characteristics.
 * @param audioFile The audio file to analyze.
 * @returns An object containing the transcription and voice analysis.
 */
export async function transcribeAndAnalyzeVoice(audioFile: File): Promise<{ transcription: string, analysis: VoiceAnalysis }> {
  try {
    const audioPart = await fileToGenerativePart(audioFile);
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { 
          parts: [
            audioPart,
            { text: "Transcribe the audio and analyze the speaker's voice. Provide the output in a JSON object with five keys: 'transcription' (string), 'gender' ('Male' or 'Female'), 'pitch' ('low', 'medium', or 'high'), 'emotion' (a single descriptive word like 'neutral', 'happy', 'calm', 'energetic'), and 'vocal_style' (a short, descriptive phrase of the overall tone, e.g., 'warm and reassuring', 'formal and clear')." }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            transcription: { type: Type.STRING },
            gender: { type: Type.STRING, enum: ['Male', 'Female'] },
            pitch: { type: Type.STRING, enum: ['low', 'medium', 'high'] },
            emotion: { type: Type.STRING },
            vocal_style: { type: Type.STRING }
          },
          required: ["transcription", "gender", "pitch", "emotion", "vocal_style"]
        }
      }
    });

    let jsonString = response.text.trim();
    // Handle cases where the API might wrap the JSON in markdown
    if (jsonString.startsWith('```json')) {
      jsonString = jsonString.slice(7, -3).trim();
    } else if (jsonString.startsWith('```')) {
      jsonString = jsonString.slice(3, -3).trim();
    }
    
    const result = JSON.parse(jsonString);

    return {
        transcription: result.transcription,
        analysis: {
            gender: result.gender,
            pitch: result.pitch,
            emotion: result.emotion,
            vocal_style: result.vocal_style,
        }
    };

  } catch (error) {
    console.error("Error analyzing voice:", error);
    if (error instanceof Error) {
        throw new Error(`Falha ao analisar a voz: ${error.message}`);
    }
    throw new Error("Falha ao analisar a voz. Verifique o console para mais detalhes.");
  }
}

/**
 * Generates speech from text using the Gemini API with specific voice characteristics.
 * @param text The text to convert to speech.
 * @param options An object containing either the voice analysis or a specific voice ID.
 * @param speed The desired speed of the speech (e.g., 1.0 for normal).
 * @returns A base64 encoded string of the audio data.
 */
export async function generateSpeech(
  text: string,
  options: {
    analysis?: VoiceAnalysis | null;
    voiceId?: string | null;
  },
  speed: number
): Promise<string> {
  try {
    let prompt: string;
    let voiceName: string;

    let speedDescription = 'normal-paced';
    if (speed < 0.9) speedDescription = 'slow';
    if (speed > 1.2) speedDescription = 'fast';

    if (options.voiceId) {
      voiceName = options.voiceId;
      prompt = `Narrate the following text at a ${speedDescription} pace: "${text}"`;
    } else if (options.analysis) {
      const analysis = options.analysis;
      voiceName = analysis.gender === 'Female' ? 'Kore' : 'Zephyr'; // Default clone voices
      prompt = `Act as a voiceover artist. Embody a character with a ${analysis.gender.toLowerCase()} voice. The voice has a ${analysis.pitch} pitch and should convey a ${analysis.emotion} emotion. The overall style is "${analysis.vocal_style}". Please narrate the following text at a ${speedDescription} pace: "${text}"`;
    } else {
      throw new Error("É necessário fornecer uma análise de voz ou um ID de voz.");
    }


    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName },
          },
        },
      },
    });

    const base64Audio =
      response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      throw new Error("Nenhum dado de áudio recebido da API.");
    }

    return base64Audio;
  } catch (error) {
    console.error("Error generating speech:", error);
    if (error instanceof Error) {
        throw new Error(`Falha ao gerar a narração: ${error.message}`);
    }
    throw new Error("Falha ao gerar a narração. Por favor, tente novamente.");
  }
}
