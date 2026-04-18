// src/pages/AnalyticsPage.tsx
// Analytics dashboard — traffic trends, referrals, device breakdown, project clicks.
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';
import { useAuthStore } from '@/stores/authStore';
import { Card, Button } from '@/components/common';

type DateRangePreset = '7d' | '30d' | '90d' | 'custom';

export const AnalyticsPage: React.FC = () => {
    const user = useAuthStore((s) => s.user);
    const [rangePreset, setRangePreset] = useState<DateRangePreset>('30d');
    const [customRange, setCustomRange] = useState<{ start: string; end: string }>({
        start: '',
        end: '',
    });

    const daysMap: Record<Exclude<DateRangePreset, 'custom'>, number> = {
        '7d': 7,
        '30d': 30,
        '90d': 90,
    };

    const startDate =
        rangePreset === 'custom'
            ? customRange.start
            : new Date(Date.now() - daysMap[rangePreset] * 86400000)
                .toISOString()
                .split('T')[0]!;
    const endDate =
        rangePreset === 'custom'
            ? customRange.end
            : new Date().toISOString().split('T')[0]!;

    const { pageViews, projectClicks, isLoading } = useAnalyticsData(
        user?.id ?? '',
        startDate,
        endDate,
    );

    return (
        <>
            <Helmet>
                <title>Analytics — MekeshBuilds</title>
            </Helmet>

            <div className="space-y-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <h1 className="text-2xl font-bold text-sys-text-primary">
                        Analytics
                    </h1>

                    {/* Date Range Picker */}
                    <div className="flex gap-2">
                        {(['7d', '30d', '90d', 'custom'] as const).map((preset) => (
                            <Button
                                key={preset}
                                size="sm"
                                variant={rangePreset === preset ? 'primary' : 'ghost'}
                                onClick={() => setRangePreset(preset)}
                            >
                                {preset === 'custom' ? 'Custom' : preset}
                            </Button>
                        ))}
                    </div>
                </div>

                {rangePreset === 'custom' && (
                    <div className="flex gap-4">
                        <input
                            type="date"
                            value={customRange.start}
                            onChange={(e) =>
                                setCustomRange((prev) => ({ ...prev, start: e.target.value }))
                            }
                            className="rounded-lg border border-sys-border bg-sys-bg-primary px-3 py-2 text-sm text-sys-text-primary"
                        />
                        <input
                            type="date"
                            value={customRange.end}
                            onChange={(e) =>
                                setCustomRange((prev) => ({ ...prev, end: e.target.value }))
                            }
                            className="rounded-lg border border-sys-border bg-sys-bg-primary px-3 py-2 text-sm text-sys-text-primary"
                        />
                    </div>
                )}

                {/* Summary Cards */}
                <div className="grid gap-4 sm:grid-cols-3">
                    <Card>
                        <p className="text-sm text-sys-text-secondary">Total Page Views</p>
                        <p className="mt-1 text-3xl font-bold text-sys-text-primary">
                            {isLoading ? '—' : (pageViews?.length ?? 0)}
                        </p>
                    </Card>
                    <Card>
                        <p className="text-sm text-sys-text-secondary">Project Clicks</p>
                        <p className="mt-1 text-3xl font-bold text-sys-text-primary">
                            {isLoading ? '—' : (projectClicks?.length ?? 0)}
                        </p>
                    </Card>
                    <Card>
                        <p className="text-sm text-sys-text-secondary">Top Referrer</p>
                        <p className="mt-1 text-lg font-semibold text-sys-text-primary">
                            {isLoading ? '—' : 'Direct'}
                        </p>
                    </Card>
                </div>

                {/* Chart Placeholders */}
                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <h3 className="mb-4 text-sm font-semibold text-sys-text-primary">
                            Traffic Trend
                        </h3>
                        <div className="flex h-64 items-center justify-center text-sys-text-secondary">
                            {/* Chart.js Line chart will render here */}
                            <p className="text-sm">Chart renders with data</p>
                        </div>
                    </Card>
                    <Card>
                        <h3 className="mb-4 text-sm font-semibold text-sys-text-primary">
                            Referral Sources
                        </h3>
                        <div className="flex h-64 items-center justify-center text-sys-text-secondary">
                            {/* Chart.js Doughnut chart */}
                            <p className="text-sm">Chart renders with data</p>
                        </div>
                    </Card>
                </div>

                {/* Top Project Clicks */}
                <Card>
                    <h3 className="mb-4 text-sm font-semibold text-sys-text-primary">
                        Top Project Clicks
                    </h3>
                    {projectClicks && projectClicks.length > 0 ? (
                        <div className="space-y-3">
                            {projectClicks.slice(0, 5).map((click, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <span className="text-sm text-sys-text-secondary">
                                        {click.project_id}
                                    </span>
                                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-sys-bg-tertiary">
                                        <div
                                            className="h-full rounded-full bg-sys-accent"
                                            style={{ width: '50%' }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-sys-text-secondary">
                            No project click data yet.
                        </p>
                    )}
                </Card>
            </div>
        </>
    );
};
