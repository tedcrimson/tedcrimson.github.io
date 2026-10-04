import { Project, parseProjectCredits } from '../data/projects';
import { SiteSettings } from '../context/DataContext';

export interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  type?: 'website' | 'article' | 'profile';
  canonicalUrl?: string;
  noIndex?: boolean;
  schema?: object;
}

const DEFAULT_ORIGIN =
  typeof window !== 'undefined' && window.location.origin
    ? window.location.origin
    : 'https://tedcrimson.github.io';

const DEFAULT_TITLE = 'Tedo Makharadze — Creative Technologist & Artist Portfolio';
const DEFAULT_DESC =
  'Contemporary experimental art archive and portfolio of creative technologist and artist Tedo Makharadze, featuring interactive installations, realtime graphics, and spatial experiences.';
const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1600&q=80';

export function updatePageSEO(props: SEOProps) {
  if (typeof document === 'undefined') return;

  const title = props.title ? `${props.title}` : DEFAULT_TITLE;
  const description = props.description || DEFAULT_DESC;
  const image = props.image || DEFAULT_IMAGE;
  const type = props.type || 'website';
  const url = props.canonicalUrl || (typeof window !== 'undefined' ? window.location.href : DEFAULT_ORIGIN);

  // 1. Page Title
  document.title = title;

  // 2. Helper to set or create meta tag
  const setMeta = (attr: 'name' | 'property', key: string, content: string) => {
    let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, key);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  // Robots indexing
  if (props.noIndex) {
    setMeta('name', 'robots', 'noindex, nofollow');
  } else {
    setMeta('name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
  }

  // Standard Meta
  setMeta('name', 'description', description);
  setMeta('name', 'author', 'Tedo Makharadze');

  // OpenGraph
  setMeta('property', 'og:title', title);
  setMeta('property', 'og:description', description);
  setMeta('property', 'og:image', image);
  setMeta('property', 'og:url', url);
  setMeta('property', 'og:type', type);
  setMeta('property', 'og:site_name', 'Tedo Makharadze Portfolio');
  setMeta('property', 'og:locale', 'en_US');

  // Twitter / X
  setMeta('name', 'twitter:card', 'summary_large_image');
  setMeta('name', 'twitter:site', '@tedomakharadze');
  setMeta('name', 'twitter:creator', '@tedomakharadze');
  setMeta('name', 'twitter:title', title);
  setMeta('name', 'twitter:description', description);
  setMeta('name', 'twitter:image', image);

  // Canonical Link
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);

  // Schema.org JSON-LD
  let scriptEl = document.getElementById('schema-structured-data') as HTMLScriptElement | null;
  if (!scriptEl) {
    scriptEl = document.createElement('script');
    scriptEl.id = 'schema-structured-data';
    scriptEl.type = 'application/ld+json';
    document.head.appendChild(scriptEl);
  }

  if (props.schema) {
    scriptEl.textContent = JSON.stringify(props.schema, null, 2);
  }
}

export function getProjectSchema(project: Project, origin = DEFAULT_ORIGIN) {
  const credits = parseProjectCredits(project);
  const projectUrl = `${origin}/#project/${project.slug || project.id}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'VisualArtwork',
    '@id': projectUrl,
    name: project.title,
    headline: project.title,
    dateCreated: project.year,
    description: project.shortDescription || project.statement || `${project.title} by Tedo Makharadze`,
    image: project.heroImage,
    artform: project.category,
    genre: project.discipline,
    locationCreated: project.location
      ? {
          '@type': 'Place',
          name: project.location,
        }
      : undefined,
    creator: {
      '@type': 'Person',
      name: 'Tedo Makharadze',
      jobTitle: 'Creative Technologist / Artist',
      url: origin,
    },
    contributor: credits.map((c) => ({
      '@type': 'Person',
      name: c.name,
      roleName: c.role,
    })),
    url: projectUrl,
  };
}

export function getCategoryPageSchema(category: 'installation' | 'performance', origin = DEFAULT_ORIGIN) {
  const isInstallation = category === 'installation';
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${origin}/#${category}`,
    name: isInstallation ? 'Interactive Installations — Tedo Makharadze' : 'Audiovisual Performances — Tedo Makharadze',
    description: isInstallation
      ? 'Archive of interactive installations, kinetic environments, and spatial light sculptures.'
      : 'Archive of audiovisual performances, realtime compute shaders, and algorithmic scenography.',
    url: `${origin}/#${category}`,
    author: {
      '@type': 'Person',
      name: 'Tedo Makharadze',
      url: origin,
    },
  };
}

export function getAboutPageSchema(siteSettings?: SiteSettings, origin = DEFAULT_ORIGIN) {
  return {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    '@id': `${origin}/#about`,
    name: 'About Tedo Makharadze — Creative Technologist & Artist',
    description:
      siteSettings?.aboutStatement ||
      'Biography, conceptual statement, and computational philosophy of creative technologist Tedo Makharadze.',
    url: `${origin}/#about`,
    mainEntity: {
      '@type': 'Person',
      name: 'Tedo Makharadze',
      jobTitle: 'Creative Technologist & Artist',
      url: origin,
      email: siteSettings?.email ? `mailto:${siteSettings.email}` : undefined,
      address: siteSettings?.location
        ? {
            '@type': 'PostalAddress',
            addressLocality: siteSettings.location,
          }
        : undefined,
    },
  };
}

export function getContactPageSchema(siteSettings?: SiteSettings, origin = DEFAULT_ORIGIN) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    '@id': `${origin}/#contact`,
    name: 'Contact Tedo Makharadze — Inquiries & Collaborations',
    description: 'Inquire about exhibitions, participatory installations, audiovisual performances, and collaborations.',
    url: `${origin}/#contact`,
    mainEntity: {
      '@type': 'Person',
      name: 'Tedo Makharadze',
      email: siteSettings?.email ? `mailto:${siteSettings.email}` : undefined,
      url: origin,
    },
  };
}

export function getGeneralSiteSchema(siteSettings?: SiteSettings, origin = DEFAULT_ORIGIN) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': `${origin}/#person`,
        name: 'Tedo Makharadze',
        jobTitle: 'Creative Technologist & Artist',
        description:
          siteSettings?.aboutStatement ||
          'Multidisciplinary creative technologist and artist working across computational design, realtime graphics, physical computing, and spatial environments.',
        url: origin,
        email: siteSettings?.email ? `mailto:${siteSettings.email}` : undefined,
        address: siteSettings?.location
          ? {
              '@type': 'PostalAddress',
              addressLocality: siteSettings.location,
            }
          : undefined,
        sameAs: siteSettings?.socials?.map((s) => s.href) || [
          'https://instagram.com/tedomakharadze',
          'https://linkedin.com/in/tedomakharadze',
          'https://github.com/tedomakharadze',
          'https://vimeo.com',
        ],
        knowsAbout: [
          'Interactive Installation',
          'TouchDesigner',
          'GLSL Shaders',
          'Projection Mapping',
          'Spatial Audio',
          'Creative Coding',
          'Physical Computing',
          'Audiovisual Scenography',
        ],
      },
      {
        '@type': 'WebSite',
        '@id': `${origin}/#website`,
        url: origin,
        name: 'Tedo Makharadze Portfolio',
        description:
          'Contemporary experimental art archive and portfolio of creative technologist and artist Tedo Makharadze.',
        publisher: {
          '@id': `${origin}/#person`,
        },
      },
    ],
  };
}
