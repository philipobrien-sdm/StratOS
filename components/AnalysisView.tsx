import React, { useState } from 'react';
import { AnalysisResult, ExpandedRisk, AIScenario, ScenarioType, UserInputs, AIMitigation } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ScatterChart, Scatter, ZAxis } from 'recharts';
import { ShieldAlert, TrendingUp, Users, AlertTriangle, GitBranch, ArrowRight, Check, PlusCircle } from 'lucide-react';
import { Tabs } from './ui/Tabs';

interface AnalysisViewProps {
  analysis: AnalysisResult | null;
  inputs: UserInputs;
  onGenerateActionPlan: (target: string) => void;
  onAdoptMitigation: (risk: ExpandedRisk, mitigation: string) => void;
  onAdoptStrategy: (stakeholderId: string, strategy: string) => void;
  isLoading: boolean;
}

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-lg text-xs sm:text-sm">
          <p className="font-bold text-slate-800 mb-1">{data.fullName}</p>
          <p className="text-slate-600">Likelihood: {data.likelihood/10} ({(data.likelihood * 10).toFixed(0)}%)</p>
          <p className="text-slate-600">Impact: {data.impact}</p>
          <p className="text-red-600 font-medium mt-1">Score: {data.z.toFixed(1)}</p>
        </div>
      );
    }
    return null;
};

export const AnalysisView: React.FC<AnalysisViewProps> = ({ 
    analysis, 
    inputs,
    onGenerateActionPlan, 
    onAdoptMitigation,
    onAdoptStrategy,
    isLoading 
}) => {
  const [activeTab, setActiveTab] = useState('Overview');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400 animate-pulse p-4">
        <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p>StratOS AI is analyzing dependencies...</p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400 p-4 text-center">
        <p>Enter project details and run analysis to begin.</p>
      </div>
    );
  }

  const riskData = analysis.expandedRisks.map(r => ({
    name: r.description.substring(0, 15) + '...',
    fullName: r.description,
    impact: r.impact,
    likelihood: r.likelihood * 10,
    z: r.impact * r.likelihood // Risk score
  }));

  const getScenarioColor = (type: ScenarioType) => {
    switch(type) {
      case ScenarioType.BestCase: return 'bg-emerald-50 border-emerald-200 text-emerald-900';
      case ScenarioType.ProbableCase: return 'bg-blue-50 border-blue-200 text-blue-900';
      case ScenarioType.WorstCase: return 'bg-red-50 border-red-200 text-red-900';
      default: return 'bg-slate-50';
    }
  };

  const getStakeholderName = (id: string) => {
    return inputs.stakeholders.find(s => s.id === id)?.name || "Unknown Stakeholder";
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-2 rounded-lg border border-slate-200 shadow-sm gap-2">
        <div className="flex items-center space-x-2 px-2 py-1">
            <TrendingUp size={20} className="text-blue-600" />
            <span className="font-bold text-slate-800">Strategic Output</span>
        </div>
        <div className="w-full sm:w-auto overflow-x-auto">
            <Tabs 
                activeTab={activeTab} 
                tabs={['Overview', 'Scenarios', 'Risks', 'Stakeholders', 'Gates']} 
                onChange={setActiveTab} 
            />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 space-y-4 sm:space-y-6 pb-20 sm:pb-0">
        
        {/* DELTAS NOTIFICATION */}
        {analysis.deltas.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
            <h3 className="text-amber-800 font-bold text-sm mb-2 flex items-center"><AlertTriangle size={16} className="mr-2"/> Recalibration Alerts</h3>
            <ul className="list-disc list-inside text-sm text-amber-900 space-y-1">
              {analysis.deltas.map((d, i) => <li key={i}>{d}</li>)}
            </ul>
          </div>
        )}

        {activeTab === 'Overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm col-span-1 md:col-span-2">
               <h3 className="font-bold text-slate-800 mb-2">Executive Summary</h3>
               <p className="text-sm sm:text-base text-slate-600 leading-relaxed">{analysis.executiveSummary}</p>
            </div>
            
            <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-4">Risk Landscape</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" dataKey="likelihood" name="Likelihood" domain={[0, 10]} label={{ value: 'Prob', position: 'bottom', offset: 0 }} />
                    <YAxis type="number" dataKey="impact" name="Impact" domain={[0, 10]} label={{ value: 'Imp', angle: -90, position: 'left' }} />
                    <ZAxis type="number" dataKey="z" range={[60, 400]} name="Risk Score" />
                    <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter name="Risks" data={riskData} fill="#ef4444" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm">
                 <h3 className="font-bold text-slate-800 mb-4">Scenario Probabilities</h3>
                 <div className="space-y-4">
                    {analysis.scenarios.map((s, i) => (
                        <div key={i}>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium truncate pr-2">{s.type}</span>
                                <span>{s.probability}%</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2.5">
                                <div 
                                    className={`h-2.5 rounded-full ${s.type === ScenarioType.BestCase ? 'bg-emerald-500' : s.type === ScenarioType.WorstCase ? 'bg-red-500' : 'bg-blue-500'}`} 
                                    style={{ width: `${s.probability}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                 </div>
                 <div className="mt-8 pt-6 border-t border-slate-100">
                    <h4 className="text-xs font-bold uppercase text-slate-500 mb-3">Outcome Targeting</h4>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <button onClick={() => onGenerateActionPlan("Achieve Best Case")} className="flex-1 bg-emerald-50 text-emerald-700 text-xs py-3 sm:py-2 rounded border border-emerald-200 hover:bg-emerald-100 transition font-medium">Target Best Case</button>
                        <button onClick={() => onGenerateActionPlan("Avoid Worst Case")} className="flex-1 bg-red-50 text-red-700 text-xs py-3 sm:py-2 rounded border border-red-200 hover:bg-red-100 transition font-medium">Avoid Worst Case</button>
                    </div>
                 </div>
            </div>
          </div>
        )}

        {activeTab === 'Scenarios' && (
            <div className="space-y-4">
                {analysis.scenarios.map((scenario, idx) => (
                    <div key={idx} className={`p-4 sm:p-6 rounded-xl border shadow-sm ${getScenarioColor(scenario.type)}`}>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-lg">{scenario.type}</h3>
                                <p className="text-sm opacity-80">{scenario.title}</p>
                            </div>
                            <div className="text-right pl-2">
                                <div className="text-2xl font-bold">{scenario.probability}%</div>
                                <div className="text-xs uppercase opacity-75">Prob</div>
                            </div>
                        </div>
                        <p className="mb-4 text-sm leading-relaxed">{scenario.narrative}</p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-4">
                            <div className="bg-white/50 p-2 rounded">
                                <span className="font-semibold block text-xs uppercase mb-1">Impact Level</span>
                                <div className="flex space-x-1">
                                    {[...Array(10)].map((_, i) => (
                                        <div key={i} className={`h-1.5 w-full rounded-sm ${i < scenario.impactLevel ? 'bg-current opacity-80' : 'bg-current opacity-20'}`}></div>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-white/50 p-2 rounded">
                                <span className="font-semibold block text-xs uppercase mb-1">Effort Required</span>
                                <div className="flex space-x-1">
                                    {[...Array(10)].map((_, i) => (
                                        <div key={i} className={`h-1.5 w-full rounded-sm ${i < scenario.effortToAchieve ? 'bg-current opacity-80' : 'bg-current opacity-20'}`}></div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/60 p-3 rounded text-sm">
                            <span className="font-bold flex items-center mb-1"><ShieldAlert size={14} className="mr-1"/> Fragility Markers</span>
                            <ul className="list-disc list-inside opacity-90 text-xs sm:text-sm">
                                {scenario.fragilityMarkers.map((m, i) => <li key={i}>{m}</li>)}
                            </ul>
                        </div>
                    </div>
                ))}
            </div>
        )}

        {activeTab === 'Risks' && (
            <div className="space-y-4">
                {analysis.expandedRisks.map((risk, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                        {risk.isAIGenerated && (
                            <div className="absolute top-0 right-0 bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-1 rounded-bl-lg">
                                AI Detected
                            </div>
                        )}
                        <div className="flex items-start justify-between mb-2 pr-6">
                            <h4 className="font-bold text-slate-800 text-sm sm:text-base">{risk.description}</h4>
                            <span className={`text-xs px-2 py-1 rounded font-medium shrink-0 ml-2 ${risk.impact * risk.likelihood > 5 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                {(risk.impact * risk.likelihood).toFixed(1)}
                            </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 mb-3 text-xs text-slate-500">
                             <div className="col-span-3 sm:col-span-1">Cat: <span className="text-slate-700 font-medium">{risk.category}</span></div>
                             <div>Prob: <span className="text-slate-700 font-medium">{(risk.likelihood * 100).toFixed(0)}%</span></div>
                             <div>Imp: <span className="text-slate-700 font-medium">{risk.impact}/10</span></div>
                        </div>
                        
                        {risk.contagionEffects && risk.contagionEffects.length > 0 && (
                            <div className="mb-3 bg-slate-50 p-2 rounded text-xs">
                                <strong className="text-slate-700">Contagion:</strong> {risk.contagionEffects.join(", ")}
                            </div>
                        )}

                        <div className="border-t border-slate-100 pt-3 mt-3">
                            <h5 className="text-xs font-bold text-slate-500 uppercase mb-2">Mitigations & Actions</h5>
                            <div className="space-y-2">
                                {risk.mitigations?.map((m, mIdx) => (
                                    <div key={mIdx} className="flex flex-col sm:flex-row sm:justify-between sm:items-start text-sm bg-emerald-50/50 p-3 rounded border border-emerald-100 gap-2">
                                        <div className="flex-1">
                                            <span className="text-slate-800 block mb-1">{m.action}</span>
                                            <div className="flex items-center space-x-3 text-xs opacity-75">
                                                <span>Cost: {m.effortCost}/10</span>
                                                <span>Effective: {m.effectiveness}/10</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2 shrink-0">
                                            <span className="text-[10px] font-bold text-emerald-700 uppercase">Residual Risk: {(m.residualRisk * 100).toFixed(0)}%</span>
                                            <button 
                                                onClick={() => onAdoptMitigation(risk, m.action)}
                                                className="flex items-center px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded transition-colors shadow-sm"
                                            >
                                                <PlusCircle size={12} className="mr-1" /> Adopt
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}

        {activeTab === 'Stakeholders' && (
             <div className="grid grid-cols-1 gap-4">
                {analysis.stakeholderStrategies.map((strat, idx) => {
                    const name = getStakeholderName(strat.stakeholderId);
                    return (
                        <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
                            <div className="md:w-1/3 border-b md:border-b-0 md:border-r border-slate-100 pb-3 md:pb-0 md:pr-4 flex flex-col justify-center">
                                <div className="flex items-center space-x-2 text-slate-800 font-bold mb-1">
                                    <Users size={18} className="text-blue-500" />
                                    <span className="text-base">{name}</span>
                                </div>
                                <div className="text-sm text-slate-500 mt-2">
                                    <span className="text-xs font-bold text-slate-400 uppercase">Cadence</span>
                                    <span className="font-medium text-slate-700 block">{strat.communicationCadence}</span>
                                </div>
                            </div>
                            <div className="md:w-2/3">
                                <div className="mb-4">
                                    <span className="text-xs font-bold text-slate-400 uppercase">Predicted Behaviour</span>
                                    <p className="text-sm text-slate-700 italic border-l-2 border-slate-200 pl-2 mt-1">{strat.predictedBehaviour}</p>
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-slate-400 uppercase mb-2 block">Leverage Points (Select to Adopt)</span>
                                    <div className="space-y-2">
                                        {strat.leveragePoints.map((lp, i) => (
                                            <div key={i} className="flex justify-between items-center text-sm bg-blue-50 text-blue-900 px-3 py-2 rounded border border-blue-100">
                                                <span>{lp}</span>
                                                <button 
                                                    onClick={() => onAdoptStrategy(strat.stakeholderId, lp)}
                                                    className="ml-2 p-1 hover:bg-blue-200 rounded text-blue-700 transition"
                                                    title="Adopt this strategy"
                                                >
                                                    <PlusCircle size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
             </div>
        )}

        {activeTab === 'Gates' && (
            <div className="space-y-4">
                {analysis.decisionGates.map((gate, idx) => (
                    <div key={idx} className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                            <h4 className="font-bold text-lg text-slate-800 flex items-center"><GitBranch size={18} className="mr-2 text-indigo-500"/>{gate.name}</h4>
                            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded w-fit">{gate.purpose}</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="bg-green-50 p-3 rounded border border-green-100">
                                <span className="block font-bold text-green-800 mb-1">Entry Criteria</span>
                                <ul className="list-disc list-inside text-green-900/80 space-y-1 text-xs sm:text-sm">
                                    {gate.entryCriteria.map((c, i) => <li key={i}>{c}</li>)}
                                </ul>
                            </div>
                            <div className="bg-indigo-50 p-3 rounded border border-indigo-100">
                                <span className="block font-bold text-indigo-800 mb-1">Exit Criteria</span>
                                <ul className="list-disc list-inside text-indigo-900/80 space-y-1 text-xs sm:text-sm">
                                    {gate.exitCriteria.map((c, i) => <li key={i}>{c}</li>)}
                                </ul>
                            </div>
                            <div className="col-span-1 md:col-span-2 bg-red-50 p-3 rounded border border-red-100">
                                <span className="block font-bold text-red-800 mb-1">Failure Conditions</span>
                                <ul className="list-disc list-inside text-red-900/80 space-y-1 text-xs sm:text-sm">
                                    {gate.failureConditions.map((c, i) => <li key={i}>{c}</li>)}
                                </ul>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}

      </div>
    </div>
  );
};
