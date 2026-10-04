import React, { useState, useEffect } from 'react';
import { Project } from './data/projects';
import { DataProvider, useData } from './context/DataContext';
import { Navigation, NavTab } from './components/Navigation';
import { HomePageFeed } from './components/HomePageFeed';
import { CategoryView } from './components/CategoryView';
import { AboutSection } from './components/AboutSection';
import { ContactSection } from './components/ContactSection';
import { ProjectPage } from './components/ProjectPage';
import { AdminPanel } from './components/AdminPanel';
import {
  updatePageSEO,
  getProjectSchema,
  getCategoryPageSchema,
  getAboutPageSchema,
  getContactPageSchema,
  getGeneralSiteSchema,
} from './utils/seo';

function MainApp() {
  const { projects, siteSettings } = useData();
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isAdminView, setIsAdminView] = useState(false);

  // Sync with browser URL pathname and hash
  useEffect(() => {
    const checkRoute = () => {
      const pathname = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase().replace('#', '');

      // Direct /admin or #admin routing
      if (
        pathname === '/admin' ||
        pathname.startsWith('/admin') ||
        hash === 'admin' ||
        hash.startsWith('/admin') ||
        hash.startsWith('admin')
      ) {
        setIsAdminView(true);
        setSelectedProject(null);
        return;
      }

      setIsAdminView(false);

      if (hash.startsWith('project/')) {
        const slug = hash.replace('project/', '');
        const found = projects.find((p) => p.slug === slug || p.id === slug);
        if (found) {
          setSelectedProject(found);
          return;
        }
      }

      if (['home', 'installation', 'performance', 'about', 'contact'].includes(hash)) {
        setSelectedProject(null);
        setCurrentTab(hash as NavTab);
      } else if (!hash) {
        setSelectedProject(null);
        setCurrentTab('home');
      }
    };

    checkRoute();
    window.addEventListener('hashchange', checkRoute);
    window.addEventListener('popstate', checkRoute);
    return () => {
      window.removeEventListener('hashchange', checkRoute);
      window.removeEventListener('popstate', checkRoute);
    };
  }, [projects]);

  // Dynamic SEO & Metadata Engine
  useEffect(() => {
    const origin =
      typeof window !== 'undefined' && window.location.origin
        ? window.location.origin
        : 'https://tedcrimson.github.io';

    if (isAdminView) {
      updatePageSEO({
        title: 'Admin Console — Tedo Makharadze Portfolio',
        description: 'Administrative dashboard for managing artworks, documentation, and portfolio settings.',
        noIndex: true,
      });
      return;
    }

    if (selectedProject) {
      updatePageSEO({
        title: `${selectedProject.title} (${selectedProject.year}) — Tedo Makharadze`,
        description:
          selectedProject.shortDescription ||
          selectedProject.statement ||
          `${selectedProject.title} — ${selectedProject.category} by Tedo Makharadze.`,
        image: selectedProject.heroImage,
        type: 'article',
        canonicalUrl: `${origin}/#project/${selectedProject.slug || selectedProject.id}`,
        schema: getProjectSchema(selectedProject, origin),
      });
      return;
    }

    switch (currentTab) {
      case 'installation':
        updatePageSEO({
          title: 'Interactive Installations — Tedo Makharadze',
          description:
            siteSettings.installationSynopsis ||
            'Site-specific light sculptures, kinetic environments, and computational installations exploring physical computing, addressable LEDs, and volumetric lasers by Tedo Makharadze.',
          type: 'website',
          canonicalUrl: `${origin}/#installation`,
          schema: getCategoryPageSchema('installation', origin),
        });
        break;

      case 'performance':
        updatePageSEO({
          title: 'Audiovisual Performances — Tedo Makharadze',
          description:
            siteSettings.performanceSynopsis ||
            'Live algorithmic scenography, real-time GLSL compute shaders, and spatial acoustic interactions by Tedo Makharadze.',
          type: 'website',
          canonicalUrl: `${origin}/#performance`,
          schema: getCategoryPageSchema('performance', origin),
        });
        break;

      case 'about':
        updatePageSEO({
          title: 'About & Statement — Tedo Makharadze',
          description:
            siteSettings.aboutStatement ||
            'Artistic philosophy, computational methodology, and biographical background of creative technologist and artist Tedo Makharadze.',
          type: 'profile',
          canonicalUrl: `${origin}/#about`,
          schema: getAboutPageSchema(siteSettings, origin),
        });
        break;

      case 'contact':
        updatePageSEO({
          title: 'Contact & Collaboration — Tedo Makharadze',
          description:
            'Inquire about new media art exhibitions, participatory installations, audiovisual performances, and creative technology collaborations with Tedo Makharadze.',
          type: 'website',
          canonicalUrl: `${origin}/#contact`,
          schema: getContactPageSchema(siteSettings, origin),
        });
        break;

      case 'home':
      default:
        updatePageSEO({
          title: 'Tedo Makharadze — Creative Technologist & Artist Portfolio',
          description:
            'Contemporary experimental art archive and portfolio of creative technologist and artist Tedo Makharadze, featuring interactive installations, realtime graphics, and spatial experiences.',
          type: 'website',
          canonicalUrl: `${origin}/`,
          schema: getGeneralSiteSchema(siteSettings, origin),
        });
        break;
    }
  }, [isAdminView, selectedProject, currentTab, siteSettings]);

  const handleSelectTab = (tab: NavTab) => {
    setSelectedProject(null);
    setIsAdminView(false);
    setCurrentTab(tab);
    window.location.hash = tab === 'home' ? '' : tab;
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
    setIsAdminView(false);
    window.location.hash = `project/${project.slug}`;
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleCloseProject = () => {
    setSelectedProject(null);
    window.location.hash = currentTab === 'home' ? '' : currentTab;
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleExitAdmin = () => {
    setIsAdminView(false);
    if (window.location.pathname.startsWith('/admin')) {
      window.history.pushState(null, '', '/');
    }
    window.location.hash = '';
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  // If on /admin route
  if (isAdminView) {
    return <AdminPanel onExit={handleExitAdmin} />;
  }

  return (
    <div className="min-h-screen bg-white text-black selection:bg-black selection:text-white">
      {/* Fixed Header Navigation */}
      <Navigation
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
      />

      {/* Main Content Area (Offset for fixed 44px header) */}
      <main className="pt-[44px]">
        {selectedProject ? (
          <ProjectPage
            project={selectedProject}
            onClose={handleCloseProject}
            onSelectProject={handleSelectProject}
          />
        ) : (
          <>
            {currentTab === 'home' && (
              <HomePageFeed
                onSelectProject={handleSelectProject}
                onNavigateToCategory={(cat) => handleSelectTab(cat as 'installation' | 'performance')}
              />
            )}

            {currentTab === 'installation' && (
              <CategoryView
                category="installation"
                onSelectProject={handleSelectProject}
              />
            )}

            {currentTab === 'performance' && (
              <CategoryView
                category="performance"
                onSelectProject={handleSelectProject}
              />
            )}

            {currentTab === 'about' && <AboutSection />}

            {currentTab === 'contact' && <ContactSection />}
          </>
        )}
      </main>

      {/* Robert Henke style subtle bottom footer with semantic microdata */}
      <footer className="max-w-[920px] mx-auto px-4 py-8 border-t border-[#e0e0e0] text-xs text-[#777777] flex flex-col sm:flex-row items-center justify-between gap-2">
        <div>
          <span>© {new Date().getFullYear()} Tedo Makharadze</span>
          <span className="mx-2 text-neutral-300">·</span>
          <span>Creative Technologist & Artist</span>
        </div>
        {siteSettings.location && (
          <div>
            <span>{siteSettings.location}</span>
          </div>
        )}
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <DataProvider>
      <MainApp />
    </DataProvider>
  );
}
