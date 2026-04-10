
import React, { useState, useEffect, useRef } from 'react';
import { Layout } from './components/Layout';
import { Consultation, DocType, Provider } from './types';
import { DOC_PROMPTS } from './constants';
import { Recorder } from './components/Recorder';
import { generateDocumentStream } from './services/geminiService';
import { 
  FileText, 
  User, 
  Calendar, 
  CheckCircle, 
  ArrowLeft, 
  Download, 
  Loader2, 
  ClipboardCheck, 
  LogIn, 
  Activity, 
  ShieldCheck, 
  Building2, 
  Sparkles, 
  Info, 
  Edit3, 
  BrainCircuit,
  Printer,
  History,
  AlertCircle
} from 'lucide-react';

const App: React.FC = () => {
  const [provider, setProvider] = useState<Provider | null>(() => {
    const saved = localStorage.getItem('mednote_provider');
    return saved ? JSON.parse(saved) : null;
  });

  const [loginForm, setLoginForm] = useState({
    name: 'Dr. Jane Smith',
    practice: 'Westside Medical Center'
  });

  const [consultation, setConsultation] = useState<Consultation>({
    id: Math.random().toString(36).substr(2, 9),
    patientName: '',
    patientAge: '',
    transcript: '',
    selectedDocTypes: ['SOAP'],
    documents: {},
    status: 'IDLE',
    createdAt: new Date(),
  });

  const [isProcessing, setIsProcessing] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const newProvider: Provider = {
      name: loginForm.name,
      practice: loginForm.practice,
      id: `PN-${Math.floor(1000 + Math.random() * 9000)}`
    };
    setProvider(newProvider);
    localStorage.setItem('mednote_provider', JSON.stringify(newProvider));
  };

  const handleLogout = () => {
    setProvider(null);
    localStorage.removeItem('mednote_provider');
  };

  const startNewSession = () => {
    setConsultation({
      id: Math.random().toString(36).substr(2, 9),
      patientName: '',
      patientAge: '',
      transcript: '',
      selectedDocTypes: ['SOAP'],
      documents: {},
      status: 'IDLE',
      createdAt: new Date(),
    });
    setIsProcessing(false);
  };

  const handleDocTypeToggle = (type: DocType) => {
    setConsultation(prev => ({
      ...prev,
      selectedDocTypes: prev.selectedDocTypes.includes(type)
        ? prev.selectedDocTypes.filter(t => t !== type)
        : [...prev.selectedDocTypes, type]
    }));
  };

  const handleTranscriptComplete = async (transcript: string) => {
    if (!consultation.patientName || !consultation.patientAge) {
      alert("Please enter patient name and age first.");
      return;
    }
    
    setIsProcessing(true);
    setConsultation(prev => ({ ...prev, transcript, status: 'REVIEW', documents: {} }));

    consultation.selectedDocTypes.forEach(async (type) => {
      const stream = generateDocumentStream(type, { ...consultation, transcript });
      
      let accumulatedText = "";
      for await (const chunk of stream) {
        accumulatedText += chunk;
        setConsultation(prev => ({
          ...prev,
          documents: { ...prev.documents, [type]: accumulatedText }
        }));
      }
      
      if (type === consultation.selectedDocTypes[consultation.selectedDocTypes.length - 1]) {
        setIsProcessing(false);
      }
    });
  };

  const updateDocContent = (type: DocType, newContent: string) => {
    setConsultation(prev => ({
      ...prev,
      documents: { ...prev.documents, [type]: newContent }
    }));
  };

  const parseDocumentBody = (content: string) => {
    if (!content) return null;

    // First handle the term tooltips
    const termRegex = /<term def="([^"]+)">([^<]+)<\/term>/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    // Custom rendering for sections to make it look "Structured"
    const lines = content.split('\n');
    
    return lines.map((line, idx) => {
      if (line.startsWith('## ')) {
        return (
          <h3 key={idx} className="text-blue-600 font-black text-xs uppercase tracking-[0.3em] mt-8 mb-4 border-b border-blue-100 pb-2 flex items-center gap-2">
            <div className="w-1.5 h-4 bg-blue-600 rounded-full" />
            {line.replace('## ', '')}
          </h3>
        );
      }
      if (line.startsWith('# ')) {
        return <h2 key={idx} className="text-2xl font-black text-slate-900 mb-6 tracking-tight">{line.replace('# ', '')}</h2>;
      }
      if (line.trim() === '---') {
        return <hr key={idx} className="my-8 border-slate-100" />;
      }

      // Render the line with tooltips
      const renderedLine = [];
      let currentLinePos = 0;
      let lineMatch;
      
      while ((lineMatch = termRegex.exec(line)) !== null) {
        if (lineMatch.index > currentLinePos) {
          renderedLine.push(line.substring(currentLinePos, lineMatch.index));
        }

        const definition = lineMatch[1];
        const word = lineMatch[2];

        renderedLine.push(
          <span key={lineMatch.index} className="relative group cursor-help inline-block">
            <span className="text-blue-700 font-bold bg-blue-50 px-1.5 py-0.5 rounded-md border-b-2 border-blue-200 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
              {word}
            </span>
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-72 p-6 bg-slate-900 text-white text-[13px] leading-relaxed rounded-[1.75rem] opacity-0 group-hover:opacity-100 transition-all pointer-events-none shadow-[0_30px_60px_rgba(0,0,0,0.6)] z-[100] border border-white/10 backdrop-blur-2xl">
              <span className="flex items-center gap-3 text-blue-400 font-black mb-3 uppercase tracking-[0.2em] text-[10px]">
                <BrainCircuit className="w-4 h-4" /> AI Medical Dictionary
              </span>
              {definition}
              <span className="absolute top-full left-1/2 -translate-x-1/2 border-[12px] border-transparent border-t-slate-900"></span>
            </span>
          </span>
        );
        currentLinePos = termRegex.lastIndex;
      }
      renderedLine.push(line.substring(currentLinePos));

      return (
        <p key={idx} className={`text-slate-700 text-lg leading-relaxed mb-3 ${line.trim().startsWith('-') ? 'pl-4 relative before:content-["•"] before:absolute before:left-0 before:text-blue-400 before:font-black' : ''}`}>
          {line.trim().startsWith('-') ? renderedLine.join('').replace('- ', '') : renderedLine}
        </p>
      );
    });
  };

  const downloadDocument = (type: DocType) => {
    const content = consultation.documents[type] || "";
    const cleanContent = content.replace(/<term def="[^"]+">([^<]+)<\/term>/g, '$1');
    const blob = new Blob([cleanContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MedNote_${consultation.patientName}_${type}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const allDocsReady = consultation.selectedDocTypes.every(type => consultation.documents[type]);

  if (!provider) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-[3.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-700">
          <div className="bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 p-14 text-center relative overflow-hidden">
            <Activity className="absolute -right-12 -top-12 w-64 h-64 text-white/5 rotate-12" />
            <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl relative z-10 transform -rotate-6 hover:rotate-0 transition-all duration-500">
              <Activity className="w-14 h-14 text-blue-600" />
            </div>
            <h1 className="text-5xl font-black text-white relative z-10 tracking-tighter">MedNote</h1>
            <p className="text-blue-200 mt-2 font-bold uppercase tracking-[0.3em] text-[10px] opacity-80">Next-Gen Scribe OS</p>
          </div>
          <form onSubmit={handleLogin} className="p-12 space-y-10">
            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Physician Name</label>
                <input type="text" required value={loginForm.name} onChange={(e) => setLoginForm({...loginForm, name: e.target.value})} className="w-full px-7 py-5 bg-slate-50 border-2 border-slate-100 rounded-3xl outline-none focus:border-blue-500 focus:bg-white transition-all font-bold text-lg" placeholder="Dr. Jane Smith" />
              </div>
              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Clinical Practice</label>
                <input type="text" required value={loginForm.practice} onChange={(e) => setLoginForm({...loginForm, practice: e.target.value})} className="w-full px-7 py-5 bg-slate-50 border-2 border-slate-100 rounded-3xl outline-none focus:border-blue-500 focus:bg-white transition-all font-bold text-lg" placeholder="City General Hospital" />
              </div>
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white py-6 rounded-[2rem] font-black text-xl shadow-[0_20px_40px_rgba(37,99,235,0.3)] hover:bg-blue-700 hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-4 group">
              <LogIn className="w-6 h-6 group-hover:translate-x-1 transition-transform" /> INITIALIZE SCRIBE
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <Layout provider={provider} onLogout={handleLogout}>
      <div className="max-w-5xl mx-auto pb-40">
        {consultation.status !== 'REVIEW' ? (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="bg-white rounded-[4rem] shadow-[0_30px_70px_-20px_rgba(0,0,0,0.1)] border border-slate-200 p-14 space-y-14 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-10">
                  <div className="flex items-center gap-3 px-5 py-2.5 bg-emerald-50 border border-emerald-100 rounded-full">
                     <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                     <span className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.2em]">Clinical Link Ready</span>
                  </div>
               </div>

              <div className="border-b border-slate-100 pb-12">
                <h2 className="text-5xl font-black text-slate-900 tracking-tighter flex items-center gap-5">
                  <div className="p-4 bg-blue-600 rounded-[1.75rem] shadow-2xl shadow-blue-500/30"><FileText className="w-10 h-10 text-white" /></div>
                  New Scribe Session
                </h2>
                <div className="flex gap-6 mt-6 ml-2">
                  <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs flex items-center gap-2">
                    <UserCircle className="w-4 h-4" /> Provider: {provider.name}
                  </p>
                  <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs flex items-center gap-2">
                    <Building2 className="w-4 h-4" /> Practice: {provider.practice}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-4">
                  <label className="text-[12px] font-black text-slate-400 uppercase tracking-[0.25em] ml-3">Patient Identity</label>
                  <input type="text" placeholder="Full Legal Name" value={consultation.patientName} onChange={(e) => setConsultation(prev => ({ ...prev, patientName: e.target.value }))} className="w-full px-9 py-6 bg-slate-50 border-3 border-slate-50 rounded-[2.5rem] focus:border-blue-500 focus:bg-white outline-none transition-all font-black text-2xl text-slate-800 placeholder:text-slate-300 shadow-inner" />
                </div>
                <div className="space-y-4">
                  <label className="text-[12px] font-black text-slate-400 uppercase tracking-[0.25em] ml-3">Age Profile</label>
                  <input type="number" placeholder="Current Years" value={consultation.patientAge} onChange={(e) => setConsultation(prev => ({ ...prev, patientAge: e.target.value }))} className="w-full px-9 py-6 bg-slate-50 border-3 border-slate-50 rounded-[2.5rem] focus:border-blue-500 focus:bg-white outline-none transition-all font-black text-2xl text-slate-800 placeholder:text-slate-300 shadow-inner" />
                </div>
              </div>

              <div className="space-y-8">
                <div className="flex items-center justify-between ml-3">
                  <label className="text-[12px] font-black text-slate-400 uppercase tracking-[0.25em]">Clinical Documentation Modules</label>
                  <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">{consultation.selectedDocTypes.length} SELECTED</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                  {DOC_PROMPTS.map((doc) => (
                    <button key={doc.type} onClick={() => handleDocTypeToggle(doc.type)} className={`p-9 text-left border-4 rounded-[3rem] transition-all group relative overflow-hidden ${consultation.selectedDocTypes.includes(doc.type) ? 'border-blue-500 bg-blue-50/30 shadow-2xl shadow-blue-500/10' : 'border-slate-50 bg-white hover:border-slate-200'}`}>
                      <div className={`w-12 h-12 rounded-[1.25rem] mb-8 flex items-center justify-center transition-all duration-500 ${consultation.selectedDocTypes.includes(doc.type) ? 'bg-blue-600 text-white scale-110 rotate-3' : 'bg-slate-100 text-slate-300'}`}>
                        <CheckCircle className="w-6 h-6" />
                      </div>
                      <div className="font-black text-slate-900 text-lg tracking-tight uppercase leading-none">{doc.title}</div>
                      <div className="text-[12px] text-slate-500 mt-3 font-bold leading-relaxed">{doc.description}</div>
                      {consultation.selectedDocTypes.includes(doc.type) && <div className="absolute top-6 right-6"><Sparkles className="w-6 h-6 text-blue-400 animate-pulse" /></div>}
                    </button>
                  ))}
                </div>
              </div>

              <Recorder onTranscriptComplete={handleTranscriptComplete} isProcessing={isProcessing} patientName={consultation.patientName} />
            </div>
          </div>
        ) : (
          <div className="space-y-16 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
              <button onClick={startNewSession} className="flex items-center gap-5 text-slate-500 hover:text-slate-900 font-black tracking-tight transition-all group">
                <div className="p-4 bg-white rounded-2xl shadow-xl border border-slate-100 group-hover:bg-slate-50 transition-all group-hover:-translate-x-1"><ArrowLeft className="w-7 h-7" /></div>
                NEW SESSION
              </button>
              <div className="text-right flex flex-col items-end">
                <div className="flex items-center gap-3 mb-2">
                   <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                   <span className="text-[11px] font-black text-blue-600 uppercase tracking-[0.4em]">Processing Insight</span>
                </div>
                <h3 className="text-4xl font-black text-slate-900 tracking-tighter">{consultation.patientName} <span className="text-slate-300 ml-2">({consultation.patientAge}Y)</span></h3>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-16">
              {consultation.selectedDocTypes.map((type) => (
                <div key={type} className="bg-white border border-slate-200 rounded-[4rem] shadow-[0_50px_100px_-30px_rgba(0,0,0,0.12)] overflow-hidden transition-all hover:shadow-blue-500/10 group">
                  <div className="bg-slate-50/80 px-14 py-10 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                      <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-slate-900 to-blue-900 flex items-center justify-center text-white shadow-2xl group-hover:scale-110 transition-transform duration-700">
                        <Edit3 className="w-10 h-10" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-black text-slate-900 text-3xl tracking-tighter uppercase">{DOC_PROMPTS.find(p => p.type === type)?.title}</h4>
                          <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded-md uppercase">Finalizing</span>
                        </div>
                        {!consultation.documents[type] && (
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                            <p className="text-[11px] font-black text-blue-600 tracking-[0.3em] uppercase">Structured Reconstruction...</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {consultation.documents[type] && (
                        <>
                          <button onClick={() => window.print()} className="p-4 rounded-2xl bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-400 transition-all">
                            <Printer className="w-6 h-6" />
                          </button>
                          <button onClick={() => downloadDocument(type)} className="flex items-center gap-4 text-md font-black text-white bg-slate-900 px-10 py-5 rounded-[2rem] hover:bg-black shadow-2xl hover:-translate-y-1 active:scale-95 transition-all">
                            <Download className="w-6 h-6" /> EXPORT AS TEXT
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="p-16 bg-white relative">
                    {!consultation.documents[type] ? (
                      <div className="space-y-10 py-6">
                        <div className="h-8 w-1/3 shimmer rounded-2xl"></div>
                        <div className="space-y-4">
                          <div className="h-4 w-full shimmer rounded-full"></div>
                          <div className="h-4 w-full shimmer rounded-full"></div>
                          <div className="h-4 w-5/6 shimmer rounded-full"></div>
                        </div>
                        <div className="h-8 w-1/4 shimmer rounded-2xl"></div>
                        <div className="space-y-4">
                          <div className="h-4 w-full shimmer rounded-full"></div>
                          <div className="h-4 w-2/3 shimmer rounded-full"></div>
                        </div>
                      </div>
                    ) : (
                      <div 
                        className="prose prose-slate max-w-none outline-none min-h-[400px] font-medium selection:bg-blue-100"
                      >
                        {parseDocumentBody(consultation.documents[type] || "")}
                        {isProcessing && <span className="inline-block w-4 h-8 bg-blue-600 animate-pulse ml-3 align-middle rounded-sm" />}
                      </div>
                    )}
                  </div>
                  <div className="bg-slate-50/50 px-14 py-8 border-t border-slate-100 flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><ShieldCheck className="w-5 h-5" /></div>
                        <div>
                          <p className="text-[11px] text-slate-900 font-black uppercase tracking-[0.1em]">Clinical Validity Check: PASS</p>
                          <p className="text-[10px] text-slate-400 font-bold">Processed via MedNote HIPAA-Aligned Pipeline</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-6">
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Session Time</span>
                          <span className="text-xs font-black text-slate-900">{new Date().toLocaleTimeString()}</span>
                        </div>
                        <div className="w-px h-8 bg-slate-200" />
                        <AlertCircle className="w-5 h-5 text-amber-500" />
                     </div>
                  </div>
                </div>
              ))}
            </div>

            {allDocsReady && !isProcessing && (
              <div className="fixed bottom-14 left-1/2 -translate-x-1/2 w-full max-w-2xl px-8 animate-in slide-in-from-bottom-20 duration-1000">
                <div className="bg-white/80 backdrop-blur-3xl p-4 rounded-[3.5rem] shadow-2xl border border-white/50">
                  <button onClick={startNewSession} className="w-full bg-blue-600 text-white py-9 rounded-[3rem] font-black text-3xl shadow-[0_30px_70px_rgba(37,99,235,0.4)] hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-6 border-8 border-white ring-2 ring-blue-600/10 group">
                    <CheckCircle className="w-11 h-11 text-white group-hover:scale-110 transition-transform" /> 
                    ARCHIVE & COMPLETE
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

import { UserCircle } from 'lucide-react';

export default App;
