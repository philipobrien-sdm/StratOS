import React, { useState, useEffect } from 'react';
import { INITIAL_INPUTS, ProjectVersion, UserInputs, ActionPlan, ExpandedRisk } from './types';
import { generateAnalysis, generateOutcomePlan } from './services/geminiService';
import { InputForms } from './components/InputForms';
import { AnalysisView } from './components/AnalysisView';
import { OutcomeModal } from './components/OutcomeModal';
import { History, Play, LayoutDashboard, PenTool } from 'lucide-react';

const App: React.FC = () => {
  const [inputs, setInputs] = useState<UserInputs>(INITIAL_INPUTS);
  const [history, setHistory] = useState<ProjectVersion[]>([]);
  const [currentVersionIndex, setCurrentVersionIndex] = useState<number>(-1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [actionPlan, setActionPlan] = useState<ActionPlan | null>(null);
  const [isPlanning, setIsPlanning] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  
  // Mobile View Toggle: 'inputs' or 'analysis'
  const [mobileView, setMobileView] = useState<'inputs' | 'analysis'>('inputs');

  // Initialize with empty version if needed, or load from local storage (mocked here)
  useEffect(() => {
     // In a real app, load from DB
  }, []);

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    // On mobile, auto-switch to analysis view when starting analysis
    setMobileView('analysis');
    try {
      const prevVersion = currentVersionIndex >= 0 ? history[currentVersionIndex] : null;
      
      const analysisResult = await generateAnalysis(inputs, prevVersion);
      
      const newVersion: ProjectVersion = {
        version: history.length + 1,
        timestamp: new Date().toISOString(),
        schemaVersion: "1.0",
        inputs: { ...inputs }, // Deep copy
        analysis: analysisResult
      };

      const newHistory = [...history, newVersion];
      setHistory(newHistory);
      setCurrentVersionIndex(newHistory.length - 1);
    } catch (err) {
      alert("Analysis failed. Please check your API Key and try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleLoadVersion = (index: number) => {
    const version = history[index];
    setInputs(version.inputs);
    setCurrentVersionIndex(index);
    setMobileView('analysis');
  };

  const handleGenerateActionPlan = async (target: string) => {
    if (currentVersionIndex === -1 || !history[currentVersionIndex].analysis) return;
    
    setShowPlanModal(true);
    setIsPlanning(true);
    try {
        const plan = await generateOutcomePlan(target, history[currentVersionIndex].analysis!, inputs);
        setActionPlan(plan);
    } catch (e) {
        setShowPlanModal(false);
        alert("Failed to generate plan");
    } finally {
        setIsPlanning(false);
    }
  };

  const handleAdoptMitigation = (risk: ExpandedRisk, mitigation: string) => {
      setInputs(prev => {
          const exists = prev.knownRisks.find(r => r.id === risk.id);
          let newRisks;
          
          if (exists) {
              // Update existing risk with new mitigation appended
              newRisks = prev.knownRisks.map(r => {
                  if (r.id === risk.id) {
                      const current = r.currentMitigations ? r.currentMitigations + "\n" : "";
                      return { ...r, currentMitigations: current + "• " + mitigation };
                  }
                  return r;
              });
          } else {
              // Add new AI identified risk to known risks
              newRisks = [...prev.knownRisks, {
                  id: risk.id || crypto.randomUUID(),
                  description: risk.description,
                  category: risk.category,
                  likelihood: risk.likelihood,
                  impact: risk.impact,
                  currentMitigations: "• " + mitigation
              }];
          }

          alert("Mitigation adopted! Check the Risks tab in inputs.");
          return { ...prev, knownRisks: newRisks };
      });
  };

  const handleAdoptStrategy = (stakeholderId: string, strategy: string) => {
      setInputs(prev => {
          const newStakeholders = prev.stakeholders.map(s => {
              if (s.id === stakeholderId) {
                  const current = s.engagementStrategy ? s.engagementStrategy + "\n" : "";
                  return { ...s, engagementStrategy: current + "• " + strategy };
              }
              return s;
          });
          
          alert("Strategy adopted! Check the Stakeholders tab in inputs.");
          return { ...prev, stakeholders: newStakeholders };
      });
  };

  const currentAnalysis = currentVersionIndex >= 0 ? history[currentVersionIndex].analysis : null;

  return (
    <div className="h-screen w-full flex flex-col bg-slate-50">
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 w-8 h-8 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30 shrink-0">
            <span className="text-white font-bold">S</span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight truncate">
            StratOS <span className="text-slate-400 font-normal hidden sm:inline">| Strategic Risk Engine</span>
          </h1>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-4">
           {/* Mobile View Toggle */}
           <div className="flex lg:hidden bg-slate-100 p-1 rounded-lg">
              <button 
                onClick={() => setMobileView('inputs')}
                className={`p-2 rounded-md ${mobileView === 'inputs' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
              >
                <PenTool size={18} />
              </button>
              <button 
                onClick={() => setMobileView('analysis')}
                className={`p-2 rounded-md ${mobileView === 'analysis' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
              >
                <LayoutDashboard size={18} />
              </button>
           </div>

           {/* Version Control Dropdown */}
           {history.length > 0 && (
             <div className="relative group">
                <button className="flex items-center space-x-2 text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-md transition">
                    <History size={16} />
                    <span className="hidden sm:inline">v{history[currentVersionIndex].version}</span>
                </button>
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-slate-100 hidden group-hover:block p-1 z-50">
                    {history.map((v, i) => (
                        <button key={v.version} onClick={() => handleLoadVersion(i)} className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 rounded flex justify-between">
                            <span>Version {v.version}</span>
                            <span className="text-slate-400">{new Date(v.timestamp).toLocaleTimeString()}</span>
                        </button>
                    ))}
                </div>
             </div>
           )}

           <button 
             onClick={handleRunAnalysis}
             disabled={isAnalyzing}
             className="bg-slate-900 hover:bg-slate-800 text-white px-3 sm:px-4 py-2 rounded-lg text-sm font-medium shadow-lg shadow-slate-900/20 flex items-center space-x-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
           >
             {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span className="hidden sm:inline">Running...</span>
                </>
             ) : (
                <>
                    <Play size={16} fill="currentColor" />
                    <span className="hidden sm:inline">Analyze</span>
                    <span className="sm:hidden">Run</span>
                </>
             )}
           </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 relative">
        {/* Left: Inputs 
            On Mobile: Shown if view is 'inputs', hidden otherwise.
            On Desktop: Always shown (col-span-5).
        */}
        <div className={`
            h-full overflow-hidden transition-all duration-300
            ${mobileView === 'inputs' ? 'block' : 'hidden lg:block'}
            lg:col-span-5
        `}>
            <InputForms inputs={inputs} setInputs={setInputs} />
        </div>

        {/* Right: Analysis 
            On Mobile: Shown if view is 'analysis', hidden otherwise.
            On Desktop: Always shown (col-span-7).
        */}
        <div className={`
            h-full overflow-hidden flex flex-col transition-all duration-300
            ${mobileView === 'analysis' ? 'block' : 'hidden lg:block'}
            lg:col-span-7
        `}>
            <AnalysisView 
                analysis={currentAnalysis} 
                inputs={inputs}
                onGenerateActionPlan={handleGenerateActionPlan}
                onAdoptMitigation={handleAdoptMitigation}
                onAdoptStrategy={handleAdoptStrategy}
                isLoading={isAnalyzing}
            />
        </div>
      </main>

      {/* Modals */}
      {showPlanModal && (
        <OutcomeModal 
            plan={actionPlan} 
            isLoading={isPlanning} 
            onClose={() => setShowPlanModal(false)} 
        />
      )}
    </div>
  );
};

export default App;
