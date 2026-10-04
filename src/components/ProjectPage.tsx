import React, { useEffect } from 'react';
import { Project, parseProjectCredits } from '../data/projects';
import { useData } from '../context/DataContext';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { ProjectMediaView } from './ProjectMedia';

interface ProjectPageProps {
  project: Project;
  onClose: () => void;
  onSelectProject: (project: Project) => void;
}

export const ProjectPage: React.FC<ProjectPageProps> = ({
  project,
  onClose,
  onSelectProject,
}) => {
  const { projects } = useData();
  const currentIndex = projects.findIndex((p) => p.id === project.id || p.slug === project.slug);
  const nextProject =
    projects.length > 0 && currentIndex !== -1
      ? projects[(currentIndex + 1) % projects.length]
      : null;
  const prevProject =
    projects.length > 0 && currentIndex !== -1
      ? projects[(currentIndex - 1 + projects.length) % projects.length]
      : null;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [project, onClose]);

  const heroType = project.heroMediaType || (project.heroImage?.toLowerCase().includes('.mp4') || project.heroImage?.toLowerCase().includes('vimeo') || project.heroImage?.toLowerCase().includes('youtube') ? 'video' : 'image');

  const hasParagraphs = project.paragraphs && project.paragraphs.length > 0;

  return (
    <article
      itemScope
      itemType="https://schema.org/VisualArtwork"
      className="max-w-[920px] mx-auto px-4 pt-16 pb-28"
    >
      {/* Top Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center justify-between pb-6 mb-6 border-b border-[#e0e0e0]">
        <button
          onClick={onClose}
          className="inline-flex items-center gap-1.5 text-xs text-[#555555] hover:text-black transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to overview</span>
        </button>

        <div className="flex items-center gap-4 text-xs text-[#666666]">
          {prevProject && (
            <button
              onClick={() => onSelectProject(prevProject)}
              className="hover:text-black cursor-pointer"
            >
              ← Previous
            </button>
          )}
          {prevProject && nextProject && <span>·</span>}
          {nextProject && (
            <button
              onClick={() => onSelectProject(nextProject)}
              className="hover:text-black cursor-pointer"
            >
              Next →
            </button>
          )}
        </div>
      </nav>

      {/* Project Header */}
      <header className="mb-8">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-2">
          <span itemProp="dateCreated" className="text-xs font-tabular tracking-wider text-[#666666] uppercase">
            {project.year}
          </span>
          {project.location && (
            <>
              <span className="text-xs text-neutral-300">—</span>
              <span itemProp="contentLocation" className="text-xs font-tabular tracking-wider text-[#666666] uppercase">
                {project.location}
              </span>
            </>
          )}
          <span className="text-xs text-neutral-300">/</span>
          <span itemProp="artform" className="text-xs tracking-wider uppercase text-[#666666]">
            {project.category}
          </span>
        </div>

        <h1 itemProp="name" className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-black">
          {project.title}
        </h1>

        {project.shortDescription && (
          <p itemProp="description" className="mt-4 text-base sm:text-lg text-[#333333] leading-relaxed max-w-3xl">
            {project.shortDescription}
          </p>
        )}
      </header>

      {/* Main Hero Visual / Video */}
      <div className="mb-12 border border-[#e0e0e0] rounded-[2px] overflow-hidden">
        <ProjectMediaView
          media={{
            type: heroType,
            url: project.heroImage,
            caption: `${project.title} — visual documentation`,
            aspectRatio: '16:9',
          }}
          priority
        />
      </div>

      {/* Project Texts: Paragraphs with Optional Titles */}
      <div className="max-w-3xl mb-14 space-y-8">
        {hasParagraphs ? (
          project.paragraphs!.map((para, idx) => (
            <div key={idx} className="space-y-2">
              {para.title && para.title.trim() !== '' && (
                <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-[#555555]">
                  {para.title}
                </h2>
              )}
              <p className="text-sm sm:text-base leading-[175%] text-[#222222] whitespace-pre-line">
                {para.text}
              </p>
            </div>
          ))
        ) : project.statement ? (
          <div className="space-y-2">
            <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-[#555555]">
              Artistic Concept
            </h2>
            <p className="text-sm sm:text-base leading-[175%] text-[#222222] whitespace-pre-line">
              {project.statement}
            </p>
          </div>
        ) : null}
      </div>

      {/* Gallery & Video Documentation */}
      {project.gallery && project.gallery.length > 0 && (
        <section className="mb-14">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#666666] mb-6">
            Documentation & Spatial Views
          </h2>
          <div className="space-y-8">
            {project.gallery.map((media, idx) => (
              <div key={`${media.url}-${idx}`} className="border border-[#e0e0e0] rounded-[2px] overflow-hidden">
                <ProjectMediaView
                  media={media}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Credits Section */}
      {(() => {
        const credits = parseProjectCredits(project);
        if (credits.length === 0) return null;

        return (
          <div className="mb-14 pt-8 border-t border-[#e0e0e0]">
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#666666] mb-5">
              Project Credits
            </h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4 text-xs">
              {credits.map((item, idx) => (
                <div key={idx}>
                  <dt className="text-[#777777] uppercase tracking-wider text-[11px] font-medium">
                    {item.role}
                  </dt>
                  <dd className="text-black font-medium mt-1 text-xs sm:text-sm">
                    {item.name}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        );
      })()}

      {/* Bottom Circular Link to Next Project */}
      <div className="pt-10 border-t border-[#e0e0e0] flex justify-between items-center text-sm">
        <button
          onClick={onClose}
          className="text-[#666666] hover:text-black underline cursor-pointer"
        >
          ← Return to overview
        </button>

        {nextProject && (
          <button
            onClick={() => onSelectProject(nextProject)}
            className="inline-flex items-center gap-1.5 font-medium text-black hover:underline cursor-pointer"
          >
            <span>Next: {nextProject.title}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </article>
  );
};
