import React, { useState } from 'react';
import { UserInputs, Priority, StakeholderInfluence, StakeholderInterest } from '../types';
import { Plus, Trash2, Sparkles, ChevronDown, ChevronUp, Briefcase, FileJson, ShieldCheck, MessageSquare } from 'lucide-react';
import { Tabs } from './ui/Tabs';
import { parseInputText } from '../services/geminiService';

interface InputFormsProps {
  inputs: UserInputs;
  setInputs: React.Dispatch<React.SetStateAction<UserInputs>>;
}

const TEST_CASE: UserInputs = {
  organization: "Rivertown Town Council",
  goals: [
    { id: "g1", description: "Construct 'Swift Crossing' Bridge to reduce congestion on Old Bridge by 60%", type: "Primary", successCriteria: "Operational by Q4 2026" },
    { id: "g2", description: "Revitalize High Street by removing heavy goods vehicle traffic", type: "Secondary", successCriteria: "25% increase in foot traffic on High St post-launch" }
  ],
  stakeholders: [
    { id: "s1", name: "High St Shop Owners Guild", role: "Local Business", influence: StakeholderInfluence.High, interest: StakeholderInterest.High, baseSupport: "Neutral" },
    { id: "s2", name: "Rivertown Commuters Association", role: "Public User Group", influence: StakeholderInfluence.High, interest: StakeholderInterest.High, baseSupport: "Supporter" },
    { id: "s3", name: "Green River Alliance", role: "Environmental NGO", influence: StakeholderInfluence.High, interest: StakeholderInterest.High, baseSupport: "Detractor" },
    { id: "s4", name: "Mayor Sterling", role: "Government Sponsor", influence: StakeholderInfluence.High, interest: StakeholderInterest.High, baseSupport: "Supporter" }
  ],
  deliverables: [
    { id: "d1", name: "Traffic Flow Simulation Model", dueDate: "2025-12-15", dependencies: "" },
    { id: "d2", name: "Geotechnical Soil & Hydrology Survey", dueDate: "2026-03-01", dependencies: "d1" },
    { id: "d3", name: "Public Consultation Findings Report", dueDate: "2026-04-15", dependencies: "d1" },
    { id: "d4", name: "Final Structural Design Pack", dueDate: "2026-07-30", dependencies: "d2, d3" },
    { id: "d5", name: "Construction Tender Award", dueDate: "2026-09-15", dependencies: "d4" }
  ],
  knownRisks: [
    { id: "r1", description: "Steel price volatility causing budget overrun >15%", likelihood: 0.7, impact: 8, category: "Financial" },
    { id: "r2", description: "Judicial Review launched by Green River Alliance delaying start", likelihood: 0.6, impact: 9, category: "Reputational" },
    { id: "r3", description: "1-in-50 year flood event during cofferdam construction", likelihood: 0.3, impact: 8, category: "Operational" }
  ]
};

// Helper for safe UUID generation
const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const InputForms: React.FC<InputFormsProps> = ({ inputs, setInputs }) => {
  const [activeTab, setActiveTab] = useState('Goals');
  const [smartInputText, setSmartInputText] = useState('');
  const [isSmartAdding, setIsSmartAdding] = useState(false);
  const [isSmartInputOpen, setIsSmartInputOpen] = useState(true);

  const handleLoadTestCase = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    
    // Check if inputs are effectively empty (clean state)
    const isClean = !inputs.organization && inputs.goals.length === 0 && inputs.stakeholders.length === 0 && inputs.deliverables.length === 0 && inputs.knownRisks.length === 0;

    if (isClean || window.confirm("This will overwrite your current inputs with the 'Rivertown Bridge' test scenario. Continue?")) {
      // Deep copy to ensure no reference issues
      setInputs(JSON.parse(JSON.stringify(TEST_CASE)));
      // Reset view to Goals to show data
      setActiveTab('Goals');
    }
  };

  const handleSmartAdd = async () => {
    if (!smartInputText.trim()) return;
    
    setIsSmartAdding(true);
    try {
      const result = await parseInputText(activeTab, smartInputText);
      
      setInputs(prev => {
        const newData = { ...prev };
        
        if (activeTab === 'Goals' && result.goals) {
          const newItems = result.goals.map((g: any) => ({ ...g, id: generateId() }));
          newData.goals = [...newData.goals, ...newItems];
        } else if (activeTab === 'Stakeholders' && result.stakeholders) {
          const newItems = result.stakeholders.map((s: any) => ({ ...s, id: generateId(), interest: s.interest || StakeholderInterest.Low }));
          newData.stakeholders = [...newData.stakeholders, ...newItems];
        } else if (activeTab === 'Deliverables' && result.deliverables) {
          const newItems = result.deliverables.map((d: any) => ({ ...d, id: generateId() }));
          newData.deliverables = [...newData.deliverables, ...newItems];
        } else if (activeTab === 'Risks' && result.risks) {
          const newItems = result.risks.map((r: any) => ({ ...r, id: generateId() }));
          newData.knownRisks = [...newData.knownRisks, ...newItems];
        }
        
        return newData;
      });
      
      setSmartInputText('');
    } catch (error) {
      console.error(error);
      alert("Failed to parse text. Please try again.");
    } finally {
      setIsSmartAdding(false);
    }
  };

  const addGoal = () => {
    setInputs(prev => ({
      ...prev,
      goals: [...prev.goals, { id: generateId(), description: '', type: 'Primary', successCriteria: '' }]
    }));
  };

  const addStakeholder = () => {
    setInputs(prev => ({
      ...prev,
      stakeholders: [...prev.stakeholders, { id: generateId(), name: '', role: '', influence: StakeholderInfluence.Low, interest: StakeholderInterest.Low, baseSupport: 'Neutral' }]
    }));
  };

  const addDeliverable = () => {
    setInputs(prev => ({
      ...prev,
      deliverables: [...prev.deliverables, { id: generateId(), name: '', dueDate: '', dependencies: '' }]
    }));
  };

  const addRisk = () => {
    setInputs(prev => ({
      ...prev,
      knownRisks: [...prev.knownRisks, { id: generateId(), description: '', likelihood: 0.5, impact: 5, category: 'Operational' }]
    }));
  };

  const updateItem = (section: keyof UserInputs, id: string, field: string, value: any) => {
    setInputs(prev => ({
      ...prev,
      [section]: (prev[section] as any[]).map((item: any) => item.id === id ? { ...item, [field]: value } : item)
    }));
  };

  const removeItem = (section: keyof UserInputs, id: string) => {
    setInputs(prev => ({
      ...prev,
      [section]: (prev[section] as any[]).filter((item: any) => item.id !== id)
    }));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full flex flex-col">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <h2 className="font-semibold text-slate-800 hidden sm:block">Project Definition</h2>
        <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-2">
             <button 
               type="button"
               onClick={handleLoadTestCase}
               className="text-xs flex items-center px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium rounded border border-indigo-200 transition-colors cursor-pointer"
               title="Load Rivertown Bridge Scenario"
             >
                <FileJson size={14} className="mr-1.5" /> Load Example
             </button>
             <Tabs activeTab={activeTab} tabs={['Goals', 'Stakeholders', 'Deliverables', 'Risks']} onChange={setActiveTab} />
        </div>
      </div>

      <div className="p-4 sm:p-6 overflow-y-auto flex-1">
        
        {/* Organization Input */}
        <div className="mb-6 relative">
            <label className="text-xs font-bold text-slate-400 uppercase mb-1 flex items-center">
                <Briefcase size={14} className="mr-1" /> Organisation / Context
            </label>
            <input 
                className="w-full text-lg font-medium text-slate-800 border-b-2 border-slate-200 focus:border-blue-500 outline-none py-2 transition-colors placeholder:font-normal placeholder:text-slate-300"
                placeholder="e.g. Acme Corp, Town Council, Startup X"
                value={inputs.organization}
                onChange={(e) => setInputs(prev => ({ ...prev, organization: e.target.value }))}
            />
        </div>

        {/* Smart Add Section */}
        <div className="mb-6 bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
          <button 
            type="button"
            onClick={() => setIsSmartInputOpen(!isSmartInputOpen)}
            className="w-full flex items-center justify-between p-3 bg-slate-100 hover:bg-slate-200 transition-colors text-sm font-medium text-slate-700"
          >
            <div className="flex items-center">
              <Sparkles size={16} className="mr-2 text-blue-600" />
              Smart Add {activeTab}
            </div>
            {isSmartInputOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          
          {isSmartInputOpen && (
            <div className="p-3">
              <textarea
                value={smartInputText}
                onChange={(e) => setSmartInputText(e.target.value)}
                placeholder={`Paste ${activeTab.toLowerCase()} notes here (e.g. from an email or meeting minutes)...`}
                className="w-full p-3 text-sm border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[80px]"
              />
              <div className="flex justify-end mt-2">
                <button 
                  type="button"
                  onClick={handleSmartAdd}
                  disabled={isSmartAdding || !smartInputText.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 py-2 rounded-md transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSmartAdding ? (
                    <>
                       <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                       Parsing...
                    </>
                  ) : (
                    <>
                      <Plus size={14} className="mr-1" />
                      Add to List
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* List Content */}
        {activeTab === 'Goals' && (
          <div className="space-y-4">
            {inputs.goals.length === 0 && <div className="text-center text-slate-400 text-sm py-8 italic">No goals defined. Add one manually or use Smart Add.</div>}
            {inputs.goals.map(goal => (
              <div key={goal.id} className="grid grid-cols-12 gap-3 items-start p-3 bg-slate-50 rounded-md border border-slate-100 relative group">
                <div className="col-span-12 sm:col-span-6">
                  <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">Goal Description</label>
                  <input className="w-full bg-white border border-slate-200 rounded p-2 text-sm" value={goal.description} onChange={e => updateItem('goals', goal.id, 'description', e.target.value)} placeholder="e.g. Launch MVP by Q3" />
                </div>
                <div className="col-span-6 sm:col-span-2">
                  <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">Type</label>
                  <select className="w-full bg-white border border-slate-200 rounded p-2 text-sm" value={goal.type} onChange={e => updateItem('goals', goal.id, 'type', e.target.value)}>
                    <option>Primary</option>
                    <option>Secondary</option>
                  </select>
                </div>
                <div className="col-span-12 sm:col-span-3">
                  <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">Success Criteria</label>
                  <input className="w-full bg-white border border-slate-200 rounded p-2 text-sm" value={goal.successCriteria} onChange={e => updateItem('goals', goal.id, 'successCriteria', e.target.value)} placeholder="Metrics..." />
                </div>
                <div className="absolute top-2 right-2 sm:static sm:col-span-1 sm:flex sm:justify-end sm:mt-6">
                   <button onClick={() => removeItem('goals', goal.id)} className="text-slate-400 hover:text-red-600 p-1"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
            <button type="button" onClick={addGoal} className="flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium py-2"><Plus size={16} className="mr-1" /> Add Manual Goal</button>
          </div>
        )}

        {activeTab === 'Stakeholders' && (
          <div className="space-y-4">
             {inputs.stakeholders.length === 0 && <div className="text-center text-slate-400 text-sm py-8 italic">No stakeholders defined.</div>}
             {inputs.stakeholders.map(sh => (
              <div key={sh.id} className="grid grid-cols-12 gap-3 items-start p-3 bg-slate-50 rounded-md border border-slate-100 relative group">
                 <div className="col-span-12 sm:col-span-3">
                   <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">Name</label>
                   <input className="w-full bg-white border border-slate-200 rounded p-2 text-sm" value={sh.name} onChange={e => updateItem('stakeholders', sh.id, 'name', e.target.value)} />
                 </div>
                 <div className="col-span-12 sm:col-span-3">
                    <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">Role</label>
                    <input className="w-full bg-white border border-slate-200 rounded p-2 text-sm" value={sh.role} onChange={e => updateItem('stakeholders', sh.id, 'role', e.target.value)} />
                 </div>
                 <div className="col-span-6 sm:col-span-2">
                    <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">Influence</label>
                    <select className="w-full bg-white border border-slate-200 rounded p-2 text-sm" value={sh.influence} onChange={e => updateItem('stakeholders', sh.id, 'influence', e.target.value)}>
                      <option value="Low">Low</option>
                      <option value="High">High</option>
                    </select>
                 </div>
                 <div className="col-span-6 sm:col-span-3">
                    <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">Support</label>
                    <select className="w-full bg-white border border-slate-200 rounded p-2 text-sm" value={sh.baseSupport} onChange={e => updateItem('stakeholders', sh.id, 'baseSupport', e.target.value)}>
                      <option>Supporter</option>
                      <option>Neutral</option>
                      <option>Detractor</option>
                    </select>
                 </div>
                 
                 {/* Adopted Strategy Display */}
                 {sh.engagementStrategy && (
                     <div className="col-span-12 mt-2 bg-blue-50/50 p-2 rounded border border-blue-100">
                        <label className="text-[10px] text-blue-500 uppercase font-bold mb-1 flex items-center"><MessageSquare size={10} className="mr-1"/> Active Engagement Strategy</label>
                        <textarea 
                           className="w-full bg-transparent text-xs text-blue-900 focus:outline-none resize-none" 
                           rows={2}
                           value={sh.engagementStrategy}
                           onChange={e => updateItem('stakeholders', sh.id, 'engagementStrategy', e.target.value)}
                        />
                     </div>
                 )}

                 <div className="absolute top-2 right-2 sm:static sm:col-span-1 sm:flex sm:justify-end sm:mt-6">
                   <button onClick={() => removeItem('stakeholders', sh.id)} className="text-slate-400 hover:text-red-600 p-1"><Trash2 size={16} /></button>
                </div>
              </div>
             ))}
             <button type="button" onClick={addStakeholder} className="flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium py-2"><Plus size={16} className="mr-1" /> Add Manual Stakeholder</button>
          </div>
        )}

        {activeTab === 'Deliverables' && (
          <div className="space-y-4">
             {inputs.deliverables.length === 0 && <div className="text-center text-slate-400 text-sm py-8 italic">No deliverables defined.</div>}
             {inputs.deliverables.map(d => (
              <div key={d.id} className="grid grid-cols-12 gap-3 items-start p-3 bg-slate-50 rounded-md border border-slate-100 relative group">
                 <div className="col-span-12 sm:col-span-4">
                   <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">Name</label>
                   <input className="w-full bg-white border border-slate-200 rounded p-2 text-sm" value={d.name} onChange={e => updateItem('deliverables', d.id, 'name', e.target.value)} />
                 </div>
                 <div className="col-span-12 sm:col-span-3">
                    <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">Due Date</label>
                    <input type="date" className="w-full bg-white border border-slate-200 rounded p-2 text-sm" value={d.dueDate} onChange={e => updateItem('deliverables', d.id, 'dueDate', e.target.value)} />
                 </div>
                 <div className="col-span-12 sm:col-span-4">
                    <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">Dependencies</label>
                    <input className="w-full bg-white border border-slate-200 rounded p-2 text-sm" value={d.dependencies} onChange={e => updateItem('deliverables', d.id, 'dependencies', e.target.value)} placeholder="e.g. Design Approval" />
                 </div>
                 <div className="absolute top-2 right-2 sm:static sm:col-span-1 sm:flex sm:justify-end sm:mt-6">
                   <button onClick={() => removeItem('deliverables', d.id)} className="text-slate-400 hover:text-red-600 p-1"><Trash2 size={16} /></button>
                </div>
              </div>
             ))}
             <button type="button" onClick={addDeliverable} className="flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium py-2"><Plus size={16} className="mr-1" /> Add Manual Deliverable</button>
          </div>
        )}

        {activeTab === 'Risks' && (
          <div className="space-y-4">
             {inputs.knownRisks.length === 0 && <div className="text-center text-slate-400 text-sm py-8 italic">No risks defined.</div>}
             {inputs.knownRisks.map(r => (
              <div key={r.id} className="grid grid-cols-12 gap-3 items-start p-3 bg-slate-50 rounded-md border border-slate-100 relative group">
                 <div className="col-span-12 sm:col-span-5">
                   <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">Risk Description</label>
                   <input className="w-full bg-white border border-slate-200 rounded p-2 text-sm" value={r.description} onChange={e => updateItem('knownRisks', r.id, 'description', e.target.value)} />
                 </div>
                 <div className="col-span-6 sm:col-span-2">
                    <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">Prob (0-1)</label>
                    <input type="number" step="0.1" min="0" max="1" className="w-full bg-white border border-slate-200 rounded p-2 text-sm" value={r.likelihood} onChange={e => updateItem('knownRisks', r.id, 'likelihood', parseFloat(e.target.value))} />
                 </div>
                 <div className="col-span-6 sm:col-span-2">
                    <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">Impact (1-10)</label>
                    <input type="number" min="1" max="10" className="w-full bg-white border border-slate-200 rounded p-2 text-sm" value={r.impact} onChange={e => updateItem('knownRisks', r.id, 'impact', parseInt(e.target.value))} />
                 </div>
                 <div className="col-span-12 sm:col-span-2">
                    <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">Category</label>
                    <select className="w-full bg-white border border-slate-200 rounded p-2 text-sm" value={r.category} onChange={e => updateItem('knownRisks', r.id, 'category', e.target.value)}>
                      <option>Operational</option>
                      <option>Financial</option>
                      <option>Strategic</option>
                      <option>Reputational</option>
                    </select>
                 </div>
                 
                 {/* Adopted Mitigation Display */}
                 {r.currentMitigations && (
                     <div className="col-span-12 mt-2 bg-emerald-50/50 p-2 rounded border border-emerald-100">
                        <label className="text-[10px] text-emerald-600 uppercase font-bold mb-1 flex items-center"><ShieldCheck size={10} className="mr-1"/> Active Mitigation Plan</label>
                        <textarea 
                           className="w-full bg-transparent text-xs text-emerald-900 focus:outline-none resize-none" 
                           rows={2}
                           value={r.currentMitigations}
                           onChange={e => updateItem('knownRisks', r.id, 'currentMitigations', e.target.value)}
                        />
                     </div>
                 )}

                 <div className="absolute top-2 right-2 sm:static sm:col-span-1 sm:flex sm:justify-end sm:mt-6">
                   <button onClick={() => removeItem('knownRisks', r.id)} className="text-slate-400 hover:text-red-600 p-1"><Trash2 size={16} /></button>
                </div>
              </div>
             ))}
             <button type="button" onClick={addRisk} className="flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium py-2"><Plus size={16} className="mr-1" /> Add Manual Risk</button>
          </div>
        )}
      </div>
    </div>
  );
};
