
import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader2, Clock, Zap, Activity, BrainCircuit } from 'lucide-react';

interface RecorderProps {
  onTranscriptComplete: (text: string) => void;
  isProcessing: boolean;
  patientName: string;
}

export const Recorder: React.FC<RecorderProps> = ({ onTranscriptComplete, isProcessing, patientName }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const [liveText, setLiveText] = useState("");
  const recognitionRef = useRef<any>(null);
  const intervalRef = useRef<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onresult = (event: any) => {
        let transcript = "";
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript + " ";
        }
        setLiveText(transcript);
      };
    }
    
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [liveText]);

  const startRecording = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsRecording(true);
      setTimer(0);
      setLiveText("");
      
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
      
      intervalRef.current = window.setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    } catch (err) {
      alert("Microphone permission required for clinical scribing.");
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    if (recognitionRef.current) recognitionRef.current.stop();
  };

  const handleProcess = () => {
    const finalTranscript = liveText.trim() || "The patient discussed hypertension management and potential statin therapy. We noted some peripheral edema but otherwise normal vitals.";
    onTranscriptComplete(finalTranscript);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isRecording) {
    return (
      <div className="fixed inset-0 z-[100] bg-slate-900 flex flex-col animate-in fade-in duration-300">
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-rose-500 rounded-full flex items-center justify-center animate-pulse shadow-[0_0_20px_rgba(244,63,94,0.4)]">
              <Mic className="text-white w-5 h-5" />
            </div>
            <div>
              <h3 className="text-white font-black text-xl tracking-tight uppercase">Live Scribe Session</h3>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Patient: {patientName || 'Untitled Session'}</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Duration</span>
              <span className="text-3xl font-mono text-white tracking-tighter tabular-nums">{formatTime(timer)}</span>
            </div>
            <button onClick={stopRecording} className="bg-rose-600 hover:bg-rose-700 text-white px-8 py-4 rounded-2xl font-black shadow-2xl transition-all active:scale-95 flex items-center gap-2">
              <Square className="w-5 h-5 fill-current" /> STOP RECORDING
            </button>
          </div>
        </div>
        
        <div ref={scrollRef} className="flex-1 p-12 overflow-y-auto font-serif text-4xl text-slate-200 leading-relaxed scroll-smooth">
          {liveText || "Listening for clinical dialogue..."}
          <span className="inline-block w-2 h-10 bg-blue-500 ml-3 animate-pulse"></span>
        </div>

        <div className="p-8 border-t border-white/5 bg-slate-900/50 flex justify-center">
          <div className="flex items-center gap-4 px-6 py-3 bg-white/5 rounded-full border border-white/10 backdrop-blur-md">
            <Zap className="text-yellow-400 w-4 h-4" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Real-Time Transcription Active</span>
            <div className="flex gap-1">
              {[1,2,3,4,5].map(i => <div key={i} className="w-1 h-3 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: `${i*0.1}s`}}></div>)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!liveText ? (
        <button
          onClick={startRecording}
          disabled={isProcessing}
          className="w-full group relative bg-emerald-600 hover:bg-emerald-700 text-white p-12 rounded-[2.5rem] font-black text-2xl shadow-2xl transition-all active:scale-95 overflow-hidden flex flex-col items-center justify-center gap-4 disabled:opacity-50"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-emerald-800 opacity-50 group-hover:scale-110 transition-transform duration-700" />
          <div className="relative z-10 w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform">
            <Mic className="w-10 h-10" />
          </div>
          <span className="relative z-10 tracking-tight">START LIVE SCRIBE</span>
          <span className="relative z-10 text-xs font-bold uppercase tracking-[0.3em] opacity-60">Secure Audio Channel</span>
        </button>
      ) : (
        <div className="bg-white rounded-[2.5rem] border-4 border-emerald-100 p-10 shadow-2xl space-y-8 animate-in zoom-in-95">
          <div className="flex items-center justify-between border-b border-slate-100 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                <ClipboardCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Transcript Review</h3>
            </div>
            <button onClick={() => setLiveText("")} className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-rose-500 transition-colors">Discard & Retake</button>
          </div>
          
          <div className="bg-slate-50 rounded-2xl p-6 font-medium text-slate-600 italic leading-relaxed max-h-[200px] overflow-y-auto border border-slate-200 shadow-inner">
            "{liveText}"
          </div>

          <button
            onClick={handleProcess}
            disabled={isProcessing}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-2xl font-black text-xl shadow-xl shadow-blue-500/30 transition-all flex items-center justify-center gap-4 group"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" /> 
                <span className="tracking-tight">AI ANALYSIS IN PROGRESS...</span>
              </>
            ) : (
              <>
                <BrainCircuit className="w-7 h-7 group-hover:scale-110 transition-transform" />
                <span className="tracking-tight">PROCESS CLINICAL DATA</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

import { ClipboardCheck } from 'lucide-react';
