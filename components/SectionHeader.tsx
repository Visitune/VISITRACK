import React from 'react';

interface SectionHeaderProps {
    icon: any;
    title: string;
    badge?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ icon: Icon, title, badge }) => (
    <div className="flex justify-between items-center mb-5">
        <h3 className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.15em] flex items-center gap-3">
            <div className="w-7 h-7 bg-[var(--accent-subtle)] rounded-lg flex items-center justify-center shadow-sm">
                <Icon className="w-4 h-4 text-[var(--accent)]" />
            </div>
            {title}
        </h3>
        {badge && (
            <span className="bg-[var(--accent)] text-white px-2.5 py-1 text-[9px] font-black rounded-md shadow-lg shadow-orange-500/20 uppercase tracking-widest">
                {badge}
            </span>
        )}
    </div>
);

export default SectionHeader;
