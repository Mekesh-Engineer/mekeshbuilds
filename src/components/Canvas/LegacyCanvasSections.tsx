import type { Experience, Profile, Project, Skill } from '@/types/profile.types';

type ThemeProps = {
    themeColor?: string;
};

function sectionSurface(themeColor: string): React.CSSProperties {
    return {
        borderColor: 'var(--sys-border)',
        background: 'color-mix(in srgb, var(--sys-bg-secondary) 88%, transparent)',
        boxShadow: `0 10px 30px color-mix(in srgb, ${themeColor} 10%, transparent)`,
    };
}

function Accent({ themeColor }: { themeColor: string }) {
    return (
        <span
            aria-hidden
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: themeColor }}
        />
    );
}

export function HeroSection({ profile, themeColor = 'var(--sys-accent)' }: { profile: Profile } & ThemeProps) {
    return (
        <section className="mt-6 rounded-2xl border p-6" style={sectionSurface(themeColor)}>
            <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-sys-text-secondary">
                <Accent themeColor={themeColor} />
                Profile
            </div>
            <h1 className="text-3xl font-black tracking-tight text-sys-text-primary">
                {profile.full_name || profile.username}
            </h1>
            <p className="mt-2 text-sm leading-7 text-sys-text-secondary">
                {profile.headline || profile.bio || 'Engineering portfolio'}
            </p>
        </section>
    );
}

export function AboutSection({ bio, location, themeColor = 'var(--sys-accent)' }: {
    bio?: string | null;
    location?: string | null;
} & ThemeProps) {
    return (
        <section className="mt-6 rounded-2xl border p-6" style={sectionSurface(themeColor)}>
            <h2 className="text-xl font-bold text-sys-text-primary">About</h2>
            <p className="mt-3 text-sm leading-7 text-sys-text-secondary">
                {bio || 'No profile summary added yet.'}
            </p>
            {location && (
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-sys-text-secondary">
                    Location: {location}
                </p>
            )}
        </section>
    );
}

export function TimelineSection({ experiences, themeColor = 'var(--sys-accent)' }: {
    experiences: Experience[];
} & ThemeProps) {
    return (
        <section className="mt-6 rounded-2xl border p-6" style={sectionSurface(themeColor)}>
            <h2 className="text-xl font-bold text-sys-text-primary">Experience</h2>
            <div className="mt-4 space-y-3">
                {experiences.map((item) => (
                    <article key={item.id} className="rounded-xl border border-sys-border bg-white/5 p-4">
                        <h3 className="text-sm font-bold text-sys-text-primary">{item.title}</h3>
                        <p className="text-xs font-semibold text-sys-text-secondary">{item.institution}</p>
                        <p className="mt-1 text-xs text-sys-text-secondary">
                            {item.start_date}
                            {item.end_date ? ` - ${item.end_date}` : ' - Present'}
                        </p>
                        {item.description && <p className="mt-2 text-xs leading-6 text-sys-text-secondary">{item.description}</p>}
                    </article>
                ))}
            </div>
        </section>
    );
}

export function SkillsSection({ skills, themeColor = 'var(--sys-accent)' }: {
    skills: Skill[];
} & ThemeProps) {
    return (
        <section className="mt-6 rounded-2xl border p-6" style={sectionSurface(themeColor)}>
            <h2 className="text-xl font-bold text-sys-text-primary">Skills</h2>
            <div className="mt-4 flex flex-wrap gap-2">
                {skills.map((skill) => (
                    <span
                        key={skill.id}
                        className="rounded-full border border-sys-border px-3 py-1.5 text-xs font-semibold text-sys-text-secondary"
                        style={{
                            background: `color-mix(in srgb, ${themeColor} 10%, transparent)`,
                        }}
                    >
                        {skill.name}
                    </span>
                ))}
            </div>
        </section>
    );
}

export function ProjectsSection({ projects, themeColor = 'var(--sys-accent)' }: {
    projects: Project[];
} & ThemeProps) {
    return (
        <section className="mt-6 rounded-2xl border p-6" style={sectionSurface(themeColor)}>
            <h2 className="text-xl font-bold text-sys-text-primary">Projects</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
                {projects.map((project) => (
                    <article key={project.id} className="rounded-xl border border-sys-border bg-white/5 p-4">
                        <h3 className="text-sm font-bold text-sys-text-primary">{project.title}</h3>
                        <p className="mt-2 text-xs leading-6 text-sys-text-secondary">{project.description || 'No summary provided.'}</p>
                    </article>
                ))}
            </div>
        </section>
    );
}

export function ContactSection({ themeColor = 'var(--sys-accent)' }: ThemeProps) {
    return (
        <section className="mt-6 mb-10 rounded-2xl border p-6" style={sectionSurface(themeColor)}>
            <h2 className="text-xl font-bold text-sys-text-primary">Contact</h2>
            <p className="mt-3 text-sm leading-7 text-sys-text-secondary">
                Reach out through the configured profile links and contact channels.
            </p>
        </section>
    );
}
