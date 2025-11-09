import React, { useState, useRef, useEffect } from 'react';
import { transcribeAndAnalyzeVoice, generateSpeech } from './services/geminiService';
import type { VoiceAnalysis, PrebuiltVoice } from './types';
import { decode, encodePCMToWav } from './utils/audioUtils';
import { PREBUILT_VOICES } from './constants';
import {
  SparklesIcon,
  LoaderIcon,
  AlertTriangleIcon,
  WaveformIcon,
  UploadIcon,
  MicIcon,
  StopCircleIcon,
  CheckCircleIcon,
  DownloadIcon,
  SearchIcon,
} from './components/IconComponents';

type Status = 'idle' | 'analyzing' | 'analyzed' | 'generating' | 'error';
type GenerationMode = 'clone' | 'select';

function App() {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [voiceAnalysis, setVoiceAnalysis] = useState<VoiceAnalysis | null>(null);
  const [transcribedText, setTranscribedText] = useState('');
  
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [speed, setSpeed] = useState(1.0);
  const [mode, setMode] = useState<GenerationMode>('select');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVoiceName, setSelectedVoiceName] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (generatedAudioUrl) {
        URL.revokeObjectURL(generatedAudioUrl);
      }
    };
  }, [generatedAudioUrl]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAudioFile(file);
      handleAudioAnalysis(file);
    }
  };
  
  const handleAudioAnalysis = async (file: File) => {
    setStatus('analyzing');
    setError(null);
    setVoiceAnalysis(null);
    setTranscribedText('');
    setGeneratedAudioUrl(null);
    setMode('clone'); // Reset to clone mode on new analysis

    try {
      const result = await transcribeAndAnalyzeVoice(file);
      setVoiceAnalysis(result.analysis);
      setTranscribedText(result.transcription);
      setStatus('analyzed');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao analisar o áudio.');
      setStatus('error');
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsRecording(true);
      audioChunksRef.current = [];
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], "recording.webm", { type: "audio/webm" });
        setAudioFile(audioFile);
        handleAudioAnalysis(audioFile);
        stream.getTracks().forEach(track => track.stop());
      };
      mediaRecorderRef.current.start();
    } catch (err) {
      setError("Permissão do microfone negada ou não encontrado.");
      setStatus('error');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleGenerateAudio = async () => {
    if (!transcribedText.trim()) {
      setError('Não há texto para gerar áudio.');
      return;
    }
    if(mode === 'select' && !selectedVoiceName) {
        setError('Por favor, selecione uma voz da lista.');
        return;
    }
    
    if (audioRef.current) {
        audioRef.current.pause();
    }

    setStatus('generating');
    setError(null);
    setGeneratedAudioUrl(null);

    try {
        const selectedVoice = mode === 'select' 
            ? PREBUILT_VOICES.find(v => v.name === selectedVoiceName) 
            : null;

        const options = {
            analysis: mode === 'clone' ? voiceAnalysis : null,
            voiceId: mode === 'select' ? selectedVoice?.id : null,
        }
      const base64Audio = await generateSpeech(transcribedText, options, speed);
      const pcmData = decode(base64Audio);
      const wavBlob = encodePCMToWav(pcmData, 24000, 1, 16);
      const url = URL.createObjectURL(wavBlob);
      setGeneratedAudioUrl(url);
      
      // Define o status de volta para 'analisado' ou 'idle' apenas em caso de sucesso.
      const successStatus = voiceAnalysis ? 'analyzed' : 'idle';
      setStatus(successStatus);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.');
      setStatus('error');
    }
  };
  
  const filteredVoices = PREBUILT_VOICES.filter(voice => 
    voice.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    voice.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const isGenerateButtonDisabled = status === 'generating' || !transcribedText.trim() || (mode === 'clone' && !voiceAnalysis) || (mode === 'select' && !selectedVoiceName)

  return (
    <div className="bg-gray-900 min-h-screen text-white font-sans flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-gray-800 rounded-lg shadow-xl p-8 space-y-6">
        <header className="text-center">
          <h1 className="text-4xl font-bold text-teal-400 flex items-center justify-center">
            <WaveformIcon className="w-8 h-8 mr-3" />
            Estúdio de Voz AI
          </h1>
          <p className="text-gray-400 mt-2">
            Clone um estilo de voz ou escolha uma da nossa biblioteca para narrar seu texto.
          </p>
        </header>

        <main className='space-y-6'>
          {/* ETAPA 1: ENTRADA DE ÁUDIO */}
          <div className="bg-gray-900/50 p-6 rounded-lg space-y-4">
            <h2 className="text-lg font-semibold text-gray-300 border-b border-gray-700 pb-2">Etapa 1: Fornecer Amostra de Voz (Opcional)</h2>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isRecording || status === 'analyzing'}
                  className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-lg inline-flex items-center justify-center transition"
                >
                 <UploadIcon className='w-5 h-5 mr-2'/>
                 Carregar Arquivo
               </button>
               <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="audio/*"/>
               
               {isRecording ? (
                  <button onClick={stopRecording} className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg inline-flex items-center justify-center transition">
                    <StopCircleIcon className="w-5 h-5 mr-2" />
                    Parar Gravação
                  </button>
               ) : (
                  <button onClick={startRecording} disabled={status === 'analyzing'} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-lg inline-flex items-center justify-center transition">
                    <MicIcon className='w-5 h-5 mr-2'/>
                    Gravar Voz
                  </button>
               )}
            </div>
            {audioFile && status !== 'analyzing' && (
              <div className='text-sm text-green-400 flex items-center justify-center bg-green-900/50 py-2 px-4 rounded-lg'>
                <CheckCircleIcon className="w-5 h-5 mr-2"/>
                Áudio selecionado: {audioFile.name}
              </div>
            )}
            {status === 'analyzing' && (
               <div className="text-center py-2 text-gray-300">Analisando voz... <div className="dot-flashing"></div></div>
            )}
          </div>
          
          {/* ETAPA 2: TEXTO E GERAÇÃO */}
          <div className="bg-gray-900/50 p-6 rounded-lg space-y-6">
            <h2 className="text-lg font-semibold text-gray-300 border-b border-gray-700 pb-2">Etapa 2: Ajustar e Gerar Narração</h2>
            
            <div>
              <label htmlFor="text-input" className="block text-sm font-medium text-gray-300 mb-2">
                Texto para narrar
              </label>
              <textarea
                id="text-input"
                rows={5}
                className="w-full bg-gray-700 border border-gray-600 rounded-md p-3 text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                value={transcribedText}
                onChange={(e) => setTranscribedText(e.target.value)}
                placeholder="Digite ou cole seu texto aqui..."
                disabled={status === 'analyzing'}
              />
            </div>

            <div className="flex bg-gray-700/50 p-1 rounded-lg">
                <button onClick={() => setMode('clone')} disabled={!voiceAnalysis} className={`w-1/2 py-2 text-sm font-medium rounded-md transition ${mode === 'clone' ? 'bg-teal-600 text-white' : 'text-gray-300 hover:bg-gray-600/50'} disabled:opacity-50 disabled:cursor-not-allowed`}>Voz Clonada</button>
                <button onClick={() => setMode('select')} className={`w-1/2 py-2 text-sm font-medium rounded-md transition ${mode === 'select' ? 'bg-teal-600 text-white' : 'text-gray-300 hover:bg-gray-600/50'}`}>Selecionar Voz</button>
            </div>

            {mode === 'clone' && voiceAnalysis && (
                <div className="bg-gray-700/50 p-4 rounded-lg grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                    <div><p className="text-sm text-gray-400">Gênero</p><p className="font-semibold text-teal-400">{voiceAnalysis.gender}</p></div>
                    <div><p className="text-sm text-gray-400">Tom (Pitch)</p><p className="font-semibold text-teal-400 capitalize">{voiceAnalysis.pitch}</p></div>
                    <div><p className="text-sm text-gray-400">Emoção</p><p className="font-semibold text-teal-400 capitalize">{voiceAnalysis.emotion}</p></div>
                    <div className="col-span-2 sm:col-span-1"><p className="text-sm text-gray-400">Estilo Vocal</p><p className="font-semibold text-teal-400 capitalize">{voiceAnalysis.vocal_style}</p></div>
                </div>
            )}

            {mode === 'select' && (
                <div className="space-y-4">
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"/>
                        <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Buscar voz por nome ou estilo..." className="w-full bg-gray-700 border border-gray-600 rounded-md pl-10 pr-4 py-2 text-white focus:ring-2 focus:ring-teal-500"/>
                    </div>
                    <div className="voice-list max-h-60 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2 pr-2">
                        {filteredVoices.map(voice => (
                            <button key={voice.name} onClick={() => setSelectedVoiceName(voice.name)} className={`w-full text-left p-3 rounded-lg transition ${selectedVoiceName === voice.name ? 'bg-teal-600 ring-2 ring-teal-400' : 'bg-gray-700 hover:bg-gray-600'}`}>
                                <p className="font-semibold">{voice.name}</p>
                                <p className="text-xs text-gray-400">{voice.description}</p>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div>
                <label htmlFor="speed-control" className="block text-sm font-medium text-gray-300 mb-2">
                    Ritmo da Narração: <span className="font-bold text-teal-400">{speed.toFixed(1)}x</span>
                </label>
                <input
                    id="speed-control"
                    type="range"
                    min="0.7"
                    max="1.5"
                    step="0.1"
                    value={speed}
                    onChange={(e) => setSpeed(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
                    disabled={status === 'analyzing'}
                />
            </div>

             <div className="text-center pt-4">
                <button
                  onClick={handleGenerateAudio}
                  disabled={isGenerateButtonDisabled}
                  className="bg-teal-600 hover:bg-teal-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-full inline-flex items-center justify-center transition-transform transform hover:scale-105"
                >
                  {status === 'generating' ? (
                    <> <LoaderIcon className="w-5 h-5 mr-2 animate-spin" /> Gerando... </>
                  ) : (
                    <> <SparklesIcon className="w-5 h-5 mr-2" /> Gerar Narração </>
                  )}
                </button>
              </div>
          </div>
          
          {error && (
            <div className="mt-6 bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-md flex items-center">
              <AlertTriangleIcon className="w-5 h-5 mr-3" />
              <span>{error}</span>
            </div>
          )}

          {generatedAudioUrl && (
            <div className="mt-6 p-4 bg-gray-700 rounded-lg flex flex-col items-center justify-center gap-4">
               <span className="text-gray-300 font-medium">Resultado da narração:</span>
              <audio ref={audioRef} src={generatedAudioUrl} controls autoPlay className="w-full" />
              <a
                href={generatedAudioUrl}
                download={`ai_voice_${Date.now()}.wav`}
                className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg inline-flex items-center justify-center transition w-full sm:w-auto"
              >
                <DownloadIcon className="w-5 h-5 mr-2" />
                Baixar Áudio
              </a>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;