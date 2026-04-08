// src/pages/DashboardPage.tsx
// Owner command center — portfolio health overview, stats, quick actions.
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { usePortfolioData } from '@/hooks/usePortfolioData';
import { useCountUp } from '@/hooks/useCountUp';
import { useClipboard } from '@/hooks/useClipboard';
import { useExportPDF } from '@/hooks/useExportPDF';
import { Card, Badge, Button } from '@/components/Shared';

export const DashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const user = useAuthStore((s) => s.user);
    const { portfolio } = usePortfolioData(user?.id);
    const { copy, isCopied } = useClipboard();
    const { exportPDF, isExporting } = useExportPDF();

    // Time-of-day greeting
    const hour = new Date().getHours();
    const greeting =
        hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    const publicUrl = `${window.location.origin}/${user?.username ?? ''}`;

    // Stat counts
    const projectCount = portfolio?.projects?.length ?? 0;
    const skillCount = portfolio?.skills?.length ?? 0;

    const animatedProjects = useCountUp(projectCount, 1200);
    const animatedSkills = useCountUp(skillCount, 1200);

    return (
        <>
            <Helmet>
                <title>Dashboard — MekeshBuilds</title>
            </Helmet>

            <div className="space-y-8">
                {/* Welcome Banner */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-sys-text-primary">
                            {greeting}, {user?.fullName?.split(' ')[0] ?? 'there'}
                        </h1>
                        <div className="mt-1 flex items-center gap-2">
                            <Badge variant={portfolio?.profile?.is_published ? 'success' : 'default'}>
                                {portfolio?.profile?.is_published ? 'Live' : 'Draft'}
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Stat Cards */}
                <div className="grid gap-4 sm:grid-cols-3">
                    <Card>
                        <p className="text-sm text-sys-text-secondary">Projects</p>
                        <p className="mt-1 text-3xl font-bold text-sys-text-primary">
                            {animatedProjects}
                        </p>
                    </Card>
                    <Card>
                        <p className="text-sm text-sys-text-secondary">Skills</p>
                        <p className="mt-1 text-3xl font-bold text-sys-text-primary">
                            {animatedSkills}
                        </p>
                    </Card>
                    <Card>
                        <p className="text-sm text-sys-text-secondary">Sections Complete</p>
                        <p className="mt-1 text-3xl font-bold text-sys-text-primary">—</p>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-3">
                    <Button onClick={() => navigate('/builder')}>Open Builder</Button>
                    <Button
                        variant="secondary"
                        onClick={() => window.open(publicUrl, '_blank')}
                    >
                        Preview Portfolio
                    </Button>
                    <Button
                        variant="secondary"
                        isLoading={isExporting}
                        onClick={() => exportPDF()}
                    >
                        Download Resume PDF
                    </Button>
                </div>

                {/* Portfolio URL Strip */}
                <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <code className="text-sm text-sys-text-secondary">{publicUrl}</code>
                    <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => copy(publicUrl)}>
                            {isCopied ? 'Copied!' : 'Copy'}
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => window.open(publicUrl, '_blank')}
                        >
                            Open
                        </Button>
                    </div>
                </Card>
            </div>
        </>
    );
};
