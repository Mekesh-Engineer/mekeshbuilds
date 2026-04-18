// src/pages/ResumeManagerPage.tsx
// Manages uploaded resume PDFs with version history.
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useExportPDF } from '@/hooks/useExportPDF';
import { Card, Button } from '@/components/common';

export const ResumeManagerPage: React.FC = () => {
    const { exportPDF, isExporting } = useExportPDF();
    const [isDragging, setIsDragging] = useState(false);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file?.type === 'application/pdf') {
            // Upload to Firebase Storage resumes bucket
            console.log('Upload file:', file.name);
        }
    };

    return (
        <>
            <Helmet>
                <title>Resume Manager — MekeshBuilds</title>
            </Helmet>

            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-sys-text-primary">
                        Resume Manager
                    </h1>
                    <Button isLoading={isExporting} onClick={() => exportPDF()}>
                        Generate from Canvas
                    </Button>
                </div>

                {/* Upload Zone */}
                <div
                    onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    className={`flex min-h-50 cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed transition-colors ${isDragging
                            ? 'border-sys-accent bg-sys-accent/5'
                            : 'border-sys-border'
                        }`}
                >
                    <div className="text-center">
                        <span className="material-icons-round mb-2 text-4xl text-sys-text-secondary">
                            upload_file
                        </span>
                        <p className="text-sm text-sys-text-secondary">
                            Drag and drop a PDF here, or click to browse
                        </p>
                        <p className="mt-1 text-xs text-sys-text-secondary">
                            PDF only, max 10 MB
                        </p>
                    </div>
                </div>

                {/* Version History */}
                <Card>
                    <h3 className="mb-4 text-sm font-semibold text-sys-text-primary">
                        Version History
                    </h3>
                    <div className="text-sm text-sys-text-secondary">
                        No resume versions uploaded yet. Upload a PDF or generate one from
                        your portfolio data.
                    </div>
                </Card>
            </div>
        </>
    );
};
