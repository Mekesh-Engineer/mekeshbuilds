import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { registerSchema, type RegisterInput } from '@/forms/authSchemas';
import { signUpWithEmail } from '@/features/auth/services/authService';
import { useNotifications } from '@/hooks/useNotifications';
import { FormInput } from '@/components/forms/FormInput';
import { AuthLayout, ShieldIcon, Spinner } from './AuthLayout';

const fadeUp = (delay = 0) => ({
    hidden: { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55, delay, ease: [0.32, 0.72, 0, 1] as const } },
});

export const RegisterPage = () => {
    const navigate = useNavigate();
    const { showError, showSuccess } = useNotifications();

    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterInput>({
        resolver: zodResolver(registerSchema),
        mode: 'onBlur',
        defaultValues: {
            role: 'user', // default role
        }
    });

    const onSubmit = async (data: RegisterInput) => {
        setIsLoading(true);
        try {
            await signUpWithEmail(data.email, data.password, data.role);
            setSubmitSuccess(true);
            showSuccess('Account Created', `Successfully created ${data.role} account!`);
            
            setTimeout(() => {
                if (data.role === 'admin') {
                    navigate('/dashboard', { replace: true });
                } else {
                    navigate('/', { replace: true });
                }
            }, 800);
        } catch (err) {
            showError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout>
            {/* Heading */}
            <motion.div variants={fadeUp(0.05)} initial="hidden" animate="visible" className="mb-8">
                <h2
                    className="font-black leading-tight tracking-tight"
                    style={{
                        fontSize: 'clamp(24px, 3vw, 30px)',
                        letterSpacing: '-0.025em',
                        color: 'var(--sys-text-primary)',
                    }}
                >
                    Create Account
                </h2>
                <p className="mt-1.5 text-[14px]" style={{ color: 'var(--sys-text-secondary)' }}>
                    Join MekeshBuilds
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
                    disabled={isLoading}
                    autoComplete="email"
                    {...register('email')}
                />

                <FormInput
                    label="Password"
                    icon="lock_outline"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create your password"
                    error={errors.password?.message}
                    disabled={isLoading}
                    autoComplete="new-password"
                    rightSlot={
                        <button
                            type="button"
                            onClick={() => setShowPassword(v => !v)}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
                            style={{ color: 'var(--sys-text-secondary)' }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'var(--sys-bg-tertiary)')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                            <span className="material-icons-round text-[18px]">
                                {showPassword ? 'visibility_off' : 'visibility'}
                            </span>
                        </button>
                    }
                    {...register('password')}
                />

                <div className="flex flex-col gap-1.5 w-full">
                    <label className="text-[13px] font-semibold" style={{ color: 'var(--sys-text-primary)' }}>
                        Select Role
                    </label>
                    <div className="relative flex items-center w-full">
                        <span
                            className="material-icons-round pointer-events-none absolute left-4 text-[18px] select-none"
                            style={{ color: 'var(--sys-text-secondary)' }}
                        >
                            admin_panel_settings
                        </span>
                        <select
                            {...register('role')}
                            disabled={isLoading}
                            className="appearance-none"
                            style={{
                                width: '100%',
                                height: 48,
                                background: 'var(--sys-bg-tertiary)',
                                border: '1.5px solid var(--sys-border)',
                                borderRadius: 12,
                                padding: '0 44px 0 44px',
                                fontSize: 15,
                                color: 'var(--sys-text-primary)',
                                outline: 'none',
                                fontFamily: 'inherit',
                                transition: 'border-color 0.2s, box-shadow 0.2s',
                            }}
                            onFocus={e => {
                                e.currentTarget.style.borderColor = 'var(--sys-accent)';
                                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255,107,44,0.18)';
                            }}
                            onBlur={e => {
                                e.currentTarget.style.borderColor = 'var(--sys-border)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                        <span className="material-icons-round pointer-events-none absolute right-4 text-[18px] text-sys-text-secondary">
                            expand_more
                        </span>
                    </div>
                </div>

                <div className="mt-1 flex justify-end items-center">
                    <Link
                        to="/auth/login"
                        className="text-[13px] font-semibold transition-all hover:-translate-x-[2px] text-sys-text-secondary hover:text-sys-text-primary"
                        style={{ pointerEvents: isLoading ? 'none' : 'auto' }}
                    >
                        Already have an account? Sign In
                    </Link>
                </div>

                <motion.button
                    type="submit"
                    disabled={isLoading || submitSuccess}
                    whileHover={!isLoading ? { scale: 1.02, y: -1 } : {}}
                    whileTap={!isLoading ? { scale: 0.98 } : {}}
                    className="relative flex h-12 w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl text-[15px] font-bold text-white transition-all"
                    style={{
                        background: submitSuccess ? 'var(--sys-success)' : 'linear-gradient(135deg, var(--sys-accent) 0%, var(--sys-accent-dark) 100%)',
                        boxShadow: submitSuccess ? '0 4px 20px rgba(34,197,94,0.4)' : '0 4px 20px rgba(255,107,44,0.35)',
                        opacity: isLoading ? 0.85 : 1,
                        cursor: isLoading ? 'not-allowed' : 'pointer',
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
                        {isLoading ? 'Creating account…' : submitSuccess ? 'Success!' : 'Create Account'}
                    </span>
                    {!isLoading && !submitSuccess && <span className="material-icons-round text-[18px]">person_add</span>}
                </motion.button>
            </motion.form>

            {/* Trust footer */}
            <motion.div
                className="mt-8 flex items-center justify-center gap-2"
                variants={fadeUp(0.36)} initial="hidden" animate="visible"
            >
                <span style={{ color: 'var(--sys-text-secondary)' }}>
                    <ShieldIcon />
                </span>
                <p className="text-[12px] font-medium" style={{ color: 'var(--sys-text-secondary)' }}>
                    Role-Based Access Control integration
                </p>
            </motion.div>
        </AuthLayout>
    );
};
