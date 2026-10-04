import React from 'react';
import { Project } from '../data/projects';
import { useData } from '../context/DataContext';

interface CategoryViewProps {
  category: 'installation' | 'performance';
  onSelectProject: (project: Project) => void;
}

export const CategoryView: React.FC<CategoryViewProps> = ({
  category,
  onSelectProject,
}) => {
  const { projects, siteSettings } = useData();

  const categoryConfig = {
    installation: {
      title: 'Installation',
      synopsis: siteSettings.installationSynopsis || '',
      disciplines: ['Installation', 'Kinetic', 'Spatial & Dome'],
    },
    performance: {
      title: 'Performance',
      synopsis: siteSettings.performanceSynopsis || '',
      disciplines: ['Audiovisual', 'Realtime & Generative'],
    },
  }[category];

  const filteredProjects = projects.filter((p) =>
    categoryConfig.disciplines.includes(p.discipline)
  );

  return (
    <div className="max-w-[920px] mx-auto px-4 pt-16 pb-24">
      {/* Category Header */}
      <h1 className="text-2xl sm:text-3xl font-medium tracking-[2px] text-black mb-4">
        {categoryConfig.title}
      </h1>

      {/* Intro Synopsis (from Firebase settings) */}
      {categoryConfig.synopsis && (
        <p className="synopsis text-sm text-[#333333] mb-10 leading-[160%]">
          {categoryConfig.synopsis}
        </p>
      )}

      {/* Grid of Works */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
        {filteredProjects.length === 0 ? (
          <div className="col-span-full py-12 text-center border border-dashed border-[#e0e0e0] rounded-[2px] text-xs text-[#777777]">
            No {categoryConfig.title.toLowerCase()} artworks listed yet.
          </div>
        ) : (
          filteredProjects.map((project) => (
            <div
              key={project.id}
              onClick={() => onSelectProject(project)}
              className="group cursor-pointer flex flex-col"
            >
              {/* Project Image / Video */}
              <div className="aspect-[16/10] overflow-hidden rounded-[3px] border border-[#e0e0e0] bg-[#0d0d0d] mb-2.5">
                {(project.heroMediaType === 'video' || project.heroImage?.toLowerCase().includes('.mp4') || project.heroImage?.toLowerCase().includes('.webm')) ? (
                  <video
                    src={project.heroImage}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    className="w-full h-full object-cover transition-opacity duration-200 group-hover:opacity-90"
                  />
                ) : project.heroImage ? (
                  <img
                    src={project.heroImage}
                    alt={project.title}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-opacity duration-200 group-hover:opacity-90"
                  />
                ) : (
                  <div className="w-full h-full bg-[#f4f4f4] flex items-center justify-center text-xs text-[#999999]">
                    No Media
                  </div>
                )}
              </div>

              {/* Title & Metadata */}
              <h3 className="text-base font-medium text-black group-hover:underline underline-offset-2 m-0">
                {project.title}
              </h3>
              <p className="text-xs text-[#666666] m-0 mt-0.5">
                {project.year} · {project.discipline}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
