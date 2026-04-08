import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { resetPasswordSchema, type ResetPasswordInput } from '@/forms/authSchemas';
import { resetPassword } from '@/features/auth/services/authService';
import { useNotifications } from '@/hooks/useNotifications';
import { FormInput } from '@/components/forms/FormInput';
import { AuthLayout, ShieldIcon, Spinner } from './AuthLayout';

const fadeUp = (delay = 0) => ({
    hidden: { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55, delay, ease: [0.32, 0.72, 0, 1] as const } },
});

export const ForgotPasswordPage = () => {
    const { showError, showSuccess } = useNotifications();
    const [isLoading, setIsLoading] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ResetPasswordInput>({
        resolver: zodResolver(resetPasswordSchema),
        mode: 'onBlur',
    });

    const onSubmit = async (data: ResetPasswordInput) => {
        setIsLoading(true);
        try {
            await resetPassword(data.email);
            setSubmitSuccess(true);
            showSuccess('Reset Link Sent', 'Check your email for instructions to reset your password.');
        } catch (err) {
            showError(err instanceof Error ? err.message : 'Failed to send reset email. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout>
            {/* Heading */}
            <motion.div variants={fadeUp(0.05)} initial="hidden" animate="visible" className="mb-8">
                <Link to="/auth/login" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-sys-text-secondary hover:text-sys-text-primary transition-colors mb-4">
                    <span className="material-icons-round text-[16px]">arrow_back</span>
                    Back to login
                </Link>
                <h2
                    className="font-black leading-tight tracking-tight"
                    style={{
                        fontSize: 'clamp(24px, 3vw, 30px)',
                        letterSpacing: '-0.025em',
                        color: 'var(--sys-text-primary)',
                    }}
                >
                    Reset Password
                </h2>
                <p className="mt-1.5 text-[14px]" style={{ color: 'var(--sys-text-secondary)' }}>
                    Enter your email to receive a reset link
                </p>
            </motion.div>

            {/* Form */}
            <motion.form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-5 w-full"
                variants={fadeUp(0.12)} initial="hidden" animate="visible" noValidate
            >
                <FormInput
                    label="Email address"
                    icon="mail_outline"
                    type="email"
                    placeholder="user@example.com"
                    error={errors.email?.message}
                    disabled={isLoading || submitSuccess}
                    autoComplete="email"
                    {...register('email')}
                />

                <motion.button
                    type="submit"
                    disabled={isLoading || submitSuccess}
                    whileHover={!isLoading && !submitSuccess ? { scale: 1.02, y: -1 } : {}}
                    whileTap={!isLoading && !submitSuccess ? { scale: 0.98 } : {}}
                    className="relative flex h-12 w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl text-[15px] font-bold text-white transition-all"
                    style={{
                        background: submitSuccess ? 'var(--sys-success)' : 'linear-gradient(135deg, var(--sys-accent) 0%, var(--sys-accent-dark) 100%)',
                        boxShadow: submitSuccess ? '0 4px 20px rgba(34,197,94,0.4)' : '0 4px 20px rgba(255,107,44,0.35)',
                        opacity: isLoading ? 0.85 : 1,
                        cursor: isLoading || submitSuccess ? 'not-allowed' : 'pointer',
                    }}
                >
                    <div className="pointer-events-none absolute inset-0"
                        style={{
                            background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.12) 50%, transparent 65%)',
                            backgroundSize: '200% 100%',
                        }}
                    />
                    {isLoading && <Spinner />}
                    {submitSuccess && <span className="material-icons-round text-[19px]">check_circle</span>}
                    <span>
                        {isLoading ? 'Sending link…' : submitSuccess ? 'Link sent!' : 'Send Reset Link'}
                    </span>
                    {!isLoading && !submitSuccess && <span className="material-icons-round text-[18px]">send</span>}
                </motion.button>
            </motion.form>

            <motion.div
                className="mt-8 flex items-center justify-center gap-2"
                variants={fadeUp(0.36)} initial="hidden" animate="visible"
            >
                <span style={{ color: 'var(--sys-text-secondary)' }}>
                    <ShieldIcon />
                </span>
                <p className="text-[12px] font-medium" style={{ color: 'var(--sys-text-secondary)' }}>
                    Secure password recovery
                </p>
            </motion.div>

        </AuthLayout>
    );
};
