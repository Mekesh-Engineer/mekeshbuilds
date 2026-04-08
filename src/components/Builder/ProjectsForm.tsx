// src/components/Builder/ProjectsForm.tsx
// Builder form for managing project entries.
import { useBuilderStore } from '@/store/builderStore';

export const ProjectsForm: React.FC = () => {
    const { projects, addProject, updateProject, removeProject } = useBuilderStore();

    return (
        <div className="space-y-4">
            {projects.map((project, index) => (
                <div
                    key={project.id}
                    className="rounded-xl border border-sys-border bg-sys-bg-surface p-4"
                >
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-sys-text-primary">
                            {project.title || 'Untitled Project'}
                        </h4>
                        <button
                            type="button"
                            onClick={() => removeProject(index)}
                            className="text-sys-text-secondary hover:text-sys-error"
                        >
                            <span className="material-icons-round text-lg">delete</span>
                        </button>
                    </div>
                    <input
                        type="text"
                        value={project.title}
                        onChange={(e) =>
                            updateProject(index, { title: e.target.value })
                        }
                        placeholder="Project Title"
                        className="mt-2 w-full rounded-lg border border-sys-border bg-sys-bg-elevated px-3 py-2 text-sys-text-primary"
                    />
                </div>
            ))}
            <button
                type="button"
                onClick={() =>
                    addProject({
                        owner_id: '',
                        title: '',
                        description: null,
                        tags: [],
                        cover_image_url: null,
                        image_urls: [],
                        github_url: null,
                        demo_url: null,
                        status: 'draft',
                        sort_order: projects.length,
                    })
                }
                className="w-full rounded-xl border border-dashed border-sys-border py-2 text-sys-text-secondary hover:border-sys-accent hover:text-sys-accent"
            >
                + Add Project
            </button>
        </div>
    );
};
