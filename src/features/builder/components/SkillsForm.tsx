// src/components/Builder/SkillsForm.tsx
// Builder form for managing skills entries.
import { useBuilderStore } from '@/stores/builderStore';

export const SkillsForm: React.FC = () => {
    const { skills, addSkill, updateSkill, removeSkill } = useBuilderStore();

    return (
        <div className="space-y-4">
            {skills.map((skill, index) => (
                <div
                    key={skill.id}
                    className="flex items-center gap-3 rounded-xl border border-sys-border bg-sys-bg-surface p-3"
                >
                    <input
                        type="text"
                        value={skill.name}
                        onChange={(e) => updateSkill(index, { name: e.target.value })}
                        placeholder="Skill Name"
                        className="flex-1 rounded-lg border border-sys-border bg-sys-bg-elevated px-3 py-2 text-sys-text-primary"
                    />
                    <input
                        type="range"
                        min={0}
                        max={100}
                        value={skill.proficiency}
                        onChange={(e) =>
                            updateSkill(index, { proficiency: Number(e.target.value) })
                        }
                        className="w-24"
                    />
                    <span className="w-10 text-right text-sm text-sys-text-secondary">
                        {skill.proficiency}%
                    </span>
                    <button
                        type="button"
                        onClick={() => removeSkill(index)}
                        className="text-sys-text-secondary hover:text-sys-error"
                    >
                        <span className="material-icons-round text-lg">close</span>
                    </button>
                </div>
            ))}
            <button
                type="button"
                onClick={() =>
                    addSkill({
                        owner_id: '',
                        name: '',
                        category: 'General',
                        proficiency: 50,
                        sort_order: skills.length,
                    })
                }
                className="w-full rounded-xl border border-dashed border-sys-border py-2 text-sys-text-secondary hover:border-sys-accent hover:text-sys-accent"
            >
                + Add Skill
            </button>
        </div>
    );
};
