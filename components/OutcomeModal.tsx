import React from 'react';
import { ActionPlan } from '../types';
import { X, CheckCircle, ArrowRight } from 'lucide-react';

interface OutcomeModalProps {
  plan: ActionPlan | null;
  onClose: () => void;
  isLoading: boolean;
}

export const OutcomeModal: React.FC<OutcomeModalProps> = ({ plan, onClose, isLoading }) => {
  if (!plan && !isLoading) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="font-bold text-lg text-slate-800">
            {isLoading ? "Developing Strategy..." : `Strategic Path: ${plan?.targetOutcome}`}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full transition"><X size={20} /></button>
        </div>

        {isLoading ? (
            <div className="p-12 flex flex-col items-center justify-center text-slate-400">
                 <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                 <p>Calculating optimal path, cost, and residual risks...</p>
            </div>
        ) : plan && (
          <div className="p-6 overflow-y-auto">
             <div className="flex gap-4 mb-6">
                <div className="flex-1 bg-blue-50 p-4 rounded-xl border border-blue-100 text-center">
                    <div className="text-2xl font-bold text-blue-700">{plan.cumulativeCost}/10</div>
                    <div className="text-xs uppercase font-bold text-blue-400">Cumulative Effort</div>
                </div>
                <div className="flex-1 bg-purple-50 p-4 rounded-xl border border-purple-100 text-center">
                    <div className="text-2xl font-bold text-purple-700">{(plan.residualProbabilityOfFailure * 100).toFixed(0)}%</div>
                    <div className="text-xs uppercase font-bold text-purple-400">Residual Failure Prob</div>
                </div>
             </div>

             <h3 className="font-bold text-slate-800 mb-3">Execution Sequence</h3>
             <div className="space-y-4 mb-6 relative pl-4 border-l-2 border-slate-100">
                {plan.steps.map((step) => (
                    <div key={step.order} className="relative">
                        <div className="absolute -left-[21px] top-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white ring-2 ring-blue-100"></div>
                        <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-sm">
                            <div className="flex justify-between items-start">
                                <p className="font-medium text-slate-800">{step.action}</p>
                                <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500 whitespace-nowrap ml-2">Owner: {step.owner}</span>
                            </div>
                        </div>
                    </div>
                ))}
             </div>

             {plan.newRisks.length > 0 && (
                 <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                    <h4 className="text-red-800 font-bold text-sm mb-2">New Risks Introduced by this Path</h4>
                    <ul className="list-disc list-inside text-sm text-red-700/80">
                        {plan.newRisks.map((r, i) => <li key={i}>{r}</li>)}
                    </ul>
                 </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
};
