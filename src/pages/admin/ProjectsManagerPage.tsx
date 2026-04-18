// src/pages/ProjectsManagerPage.tsx
// Dedicated project management workspace with sortable table.
import { Helmet } from 'react-helmet-async';
import { useAuthStore } from '@/stores/authStore';
import { usePortfolioData } from '@/hooks/usePortfolioData';
import { Card, Button, Badge } from '@/components/common';

export const ProjectsManagerPage: React.FC = () => {
    const user = useAuthStore((s) => s.user);
    const { portfolio } = usePortfolioData(user?.id);
    const projects = portfolio?.projects;

    return (
        <>
            <Helmet>
                <title>Projects — MekeshBuilds</title>
            </Helmet>

            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-sys-text-primary">
                        Projects Manager
                    </h1>
                    <div className="flex gap-3">
                        <Button variant="secondary">Sync from GitHub</Button>
                        <Button>Add Project</Button>
                    </div>
                </div>

                {/* Projects Table */}
                <Card padding="none">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-sys-border">
                                    <th className="px-4 py-3 text-xs font-medium text-sys-text-secondary">
                                        Title
                                    </th>
                                    <th className="px-4 py-3 text-xs font-medium text-sys-text-secondary">
                                        Tags
                                    </th>
                                    <th className="px-4 py-3 text-xs font-medium text-sys-text-secondary">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-xs font-medium text-sys-text-secondary">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {projects && projects.length > 0 ? (
                                    projects.map((project) => (
                                        <tr
                                            key={project.id}
                                            className="border-b border-sys-border last:border-0"
                                        >
                                            <td className="px-4 py-3 font-medium text-sys-text-primary">
                                                {project.title}
                                            </td>
                                            <td className="px-4 py-3 text-sys-text-secondary">
                                                {project.tags?.join(', ') ?? '—'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge
                                                    variant={
                                                        project.status === 'published' ? 'success' : 'default'
                                                    }
                                                >
                                                    {project.status}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex gap-2">
                                                    <Button size="sm" variant="ghost">
                                                        Edit
                                                    </Button>
                                                    <Button size="sm" variant="ghost">
                                                        Delete
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="px-4 py-8 text-center text-sys-text-secondary"
                                        >
                                            No projects yet. Add your first project to get started.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </>
    );
};
