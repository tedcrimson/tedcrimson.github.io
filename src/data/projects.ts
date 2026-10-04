export interface ProjectCredit {
  role: string;
  name: string;
}

export interface ProjectMedia {
  type: 'image' | 'video';
  url: string;
  caption?: string;
  aspectRatio?: '16:9' | '4:3' | '1:1' | '21:9';
  posterUrl?: string;
}

export interface ProjectParagraph {
  title?: string;
  text: string;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  year: string;
  location: string;
  category: string;
  discipline: 'Installation' | 'Realtime & Generative' | 'Spatial & Dome' | 'Audiovisual' | 'Kinetic';
  shortDescription: string;
  statement?: string;
  paragraphs?: ProjectParagraph[];
  heroMediaType?: 'image' | 'video';
  heroImage: string;
  technologies?: string[];
  dimensions?: string;
  duration?: string;
  specs?: {
    system?: string;
    sensors?: string;
    audio?: string;
    display?: string;
  };
  gallery: ProjectMedia[];
  creditsList?: ProjectCredit[];
  credits?:
    | ProjectCredit[]
    | {
        creativeDirection?: string;
        technology?: string;
        visuals?: string;
        sound?: string;
        interaction?: string;
        production?: string;
        collaborators?: string;
        [key: string]: string | undefined;
      };
}

export function parseProjectCredits(project: Project): ProjectCredit[] {
  if (Array.isArray(project.creditsList) && project.creditsList.length > 0) {
    return project.creditsList;
  }
  if (Array.isArray(project.credits) && project.credits.length > 0) {
    return project.credits;
  }
  if (project.credits && typeof project.credits === 'object') {
    const list: ProjectCredit[] = [];
    const roleMap: Record<string, string> = {
      creativeDirection: 'Creative Direction',
      technology: 'Creative Technology',
      visuals: 'Visuals & Shaders',
      sound: 'Sound Design',
      interaction: 'Interaction Engineering',
      production: 'Production / Exhibition',
      collaborators: 'Collaborators',
    };
    for (const [key, val] of Object.entries(project.credits)) {
      if (val && typeof val === 'string' && val.trim() !== '') {
        list.push({
          role: roleMap[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase()),
          name: val,
        });
      }
    }
    return list;
  }
  return [];
}
