import React from 'react';

interface TabProps {
  activeTab: string;
  tabs: string[];
  onChange: (tab: string) => void;
}

export const Tabs: React.FC<TabProps> = ({ activeTab, tabs, onChange }) => {
  return (
    <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg overflow-x-auto whitespace-nowrap scrollbar-hide">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 shrink-0 ${
            activeTab === tab
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};