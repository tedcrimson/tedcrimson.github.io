import React from 'react';
import { Project } from '../data/projects';
import { useData } from '../context/DataContext';

interface HomePageFeedProps {
  onSelectProject: (project: Project) => void;
  onNavigateToCategory: (category: 'installation' | 'performance') => void;
}

export const HomePageFeed: React.FC<HomePageFeedProps> = ({
  onSelectProject,
}) => {
  const { projects, siteSettings, loading } = useData();

  return (
    <div className="max-w-[920px] mx-auto px-4 pt-16 pb-24">
      {/* Page Title (Robert Henke style) */}
      <h1 className="text-2xl sm:text-3xl font-medium tracking-[2px] text-black mb-6">
        Tedo Makharadze
      </h1>

      {/* Upcoming / Current Exhibitions Box (from Firebase) */}
      {siteSettings.upcomingExhibitions && siteSettings.upcomingExhibitions.length > 0 && (
        <section
          id="upcomingDates"
          className="bg-[#f9f9f9] p-5 sm:p-6 rounded-[3px] border border-[#e0e0e0] mb-8 leading-[150%]"
        >
          <div className="font-semibold text-xs tracking-wider uppercase text-[#555555] mb-2">
            Current & Upcoming Exhibitions
          </div>
          <ul className="space-y-2 text-sm text-[#222222] list-none p-0 m-0">
            {siteSettings.upcomingExhibitions.map((item, idx) => (
              <li key={idx} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
                <span className="font-medium text-black min-w-[120px]">{item.date}</span>
                <span>
                  <strong className="font-medium">{item.title}</strong> — {item.location}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Main Events & Works Stream */}
      <div className="space-y-12">
        {loading ? (
          <div className="py-12 text-center text-xs text-[#888888] font-tabular tracking-wider">
            Loading archives...
          </div>
        ) : projects.length === 0 ? (
          <div className="py-12 text-center border border-dashed border-[#e0e0e0] rounded-[2px] text-xs text-[#777777]">
            No projects in the archive yet.
          </div>
        ) : (
          projects.map((project) => (
            <section key={project.id} className="group">
              {/* Visual Container */}
              <div
                onClick={() => onSelectProject(project)}
                className="cursor-pointer overflow-hidden rounded-[3px] border border-[#e0e0e0] bg-[#0d0d0d] mb-3 aspect-[16/9] sm:aspect-[21/10]"
              >
                {(project.heroMediaType === 'video' || project.heroImage?.toLowerCase().includes('.mp4') || project.heroImage?.toLowerCase().includes('.webm')) ? (
                  <video
                    src={project.heroImage}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    className="w-full h-full object-cover transition-opacity duration-300 hover:opacity-95"
                  />
                ) : project.heroImage ? (
                  <img
                    src={project.heroImage}
                    alt={project.title}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-opacity duration-300 hover:opacity-95"
                  />
                ) : (
                  <div className="w-full h-full bg-[#f4f4f4] flex items-center justify-center text-xs text-[#999999]">
                    No Media
                  </div>
                )}
              </div>

              {/* Synopsis paragraph (Robert Henke .synopsis style) */}
              <p className="synopsis text-sm text-[#222222]">
                <span className="font-semibold text-black">{project.year}. </span>
                <button
                  type="button"
                  onClick={() => onSelectProject(project)}
                  className="font-semibold text-black hover:underline cursor-pointer text-left"
                >
                  {project.title}
                </button>
                {project.shortDescription && <span> — {project.shortDescription} </span>}
                <button
                  type="button"
                  onClick={() => onSelectProject(project)}
                  className="text-[#555555] hover:text-black underline cursor-pointer inline font-normal ml-1"
                >
                  [Documentation & Details]
                </button>
              </p>
            </section>
          ))
        )}
      </div>
    </div>
  );
};
