import React from 'react';
import { useData } from '../context/DataContext';

export const AboutSection: React.FC = () => {
  const { siteSettings } = useData();

  const hasBio = siteSettings.bioParagraphs && siteSettings.bioParagraphs.length > 0;
  const hasStatement = Boolean(siteSettings.aboutStatement && siteSettings.aboutStatement.trim());

  return (
    <div className="max-w-[920px] mx-auto px-4 pt-16 pb-24">
      {/* Title */}
      <h1 className="text-2xl sm:text-3xl font-medium tracking-[2px] text-black mb-6">
        About
      </h1>

      {/* Main Statement */}
      {hasStatement && (
        <p className="synopsis text-base sm:text-lg font-medium text-black mb-8 leading-[150%]">
          “{siteSettings.aboutStatement}”
        </p>
      )}

      {/* Biography Content (Robert Henke style clean reading columns) */}
      {hasBio ? (
        <div className="space-y-5 text-sm sm:text-base text-[#222222] leading-[170%]">
          {siteSettings.bioParagraphs.map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </div>
      ) : !hasStatement ? (
        <div className="py-12 text-center border border-dashed border-[#e0e0e0] rounded-[2px] text-xs text-[#777777]">
          About text not yet published.
        </div>
      ) : null}

      {siteSettings.location && (
        <div className="mt-12 pt-8 border-t border-[#e0e0e0] text-xs text-[#666666]">
          <span>Tedo Makharadze · Creative Technologist / Artist · {siteSettings.location}</span>
        </div>
      )}
    </div>
  );
};
