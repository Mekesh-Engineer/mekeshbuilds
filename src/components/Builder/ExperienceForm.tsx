// src/components/Builder/ExperienceForm.tsx
// Builder form for managing work and education experience entries.
import { useBuilderStore } from '@/store/builderStore';

export const ExperienceForm: React.FC = () => {
    const { experiences, addExperience, updateExperience, removeExperience } =
        useBuilderStore();

    return (
        <div className="space-y-4">
            {experiences.map((exp, index) => (
                <div
                    key={exp.id}
                    className="rounded-xl border border-sys-border bg-sys-bg-surface p-4"
                >
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-sys-text-primary">
                            {exp.title || 'Untitled Experience'}
                        </h4>
                        <button
                            type="button"
                            onClick={() => removeExperience(index)}
                            className="text-sys-text-secondary hover:text-sys-error"
                        >
                            <span className="material-icons-round text-lg">delete</span>
                        </button>
                    </div>
                    <input
                        type="text"
                        value={exp.title}
                        onChange={(e) =>
                            updateExperience(index, { title: e.target.value })
                        }
                        placeholder="Job Title"
                        className="mt-2 w-full rounded-lg border border-sys-border bg-sys-bg-elevated px-3 py-2 text-sys-text-primary"
                    />
                </div>
            ))}
            <button
                type="button"
                onClick={() =>
                    addExperience({
                        owner_id: '',
                        type: 'work',
                        title: '',
                        institution: '',
                        employment_type: null,
                        start_date: '',
                        end_date: null,
                        description: null,
                        sort_order: experiences.length,
                    })
                }
                className="w-full rounded-xl border border-dashed border-sys-border py-2 text-sys-text-secondary hover:border-sys-accent hover:text-sys-accent"
            >
                + Add Experience
            </button>
        </div>
    );
};
