import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { loginSchema, type LoginInput } from '@/forms/authSchemas';
import { signInWithEmail, signInWithGoogle } from '@/features/auth/services/authService';
import { useNotifications } from '@/hooks/useNotifications';
import { FormInput } from '@/components/forms/FormInput';
import { AuthLayout, GoogleLogo, ShieldIcon, Spinner } from './AuthLayout';

const fadeUp = (delay = 0) => ({
    hidden: { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55, delay, ease: [0.32, 0.72, 0, 1] as const } },
});

export const LoginPage = () => {
    const navigate = useNavigate();
    const { showError } = useNotifications();

    const [isLoading, setIsLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [shakeKey, setShakeKey] = useState(0);

    const [lockoutTime, setLockoutTime] = useState<number | null>(() => {
        const stored = localStorage.getItem('admin_lockout_until');
        if (stored && parseInt(stored, 10) > Date.now()) {
            return parseInt(stored, 10);
        }
        return null;
    });

    const isLockedOut = lockoutTime !== null && lockoutTime > Date.now();
    const remainingTime = isLockedOut ? Math.ceil((lockoutTime - Date.now()) / 60000) : 0;

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
        mode: 'onBlur',
    });

    const onSubmit = async (data: LoginInput) => {
        if (isLockedOut) {
            showError(`Account temporarily locked. Try again in ${remainingTime} minutes.`);
            return;
        }

        setIsLoading(true);
        try {
            await signInWithEmail(data.email, data.password);

            localStorage.removeItem('admin_login_failures');
            localStorage.removeItem('admin_lockout_until');
            setLockoutTime(null);

            setSubmitSuccess(true);
            setTimeout(() => {
                navigate('/dashboard', { replace: true });
            }, 600);
        } catch (err) {
            setShakeKey(k => k + 1); // trigger shake

            const attempts = parseInt(localStorage.getItem('admin_login_failures') || '0', 10) + 1;
            if (attempts >= 5) {
                const unlockTime = Date.now() + 15 * 60 * 1000; // 15 mins
                localStorage.setItem('admin_lockout_until', unlockTime.toString());
                setLockoutTime(unlockTime);
                localStorage.removeItem('admin_login_failures');
                showError('Too many failed attempts. Try again in 15 minutes.');
            } else {
                localStorage.setItem('admin_login_failures', attempts.toString());
                showError(err instanceof Error ? err.message : 'Login failed. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setGoogleLoading(true);
        try {
            await signInWithGoogle();
            navigate('/dashboard', { replace: true });
        } catch (err) {
            showError(err instanceof Error ? err.message : 'Google sign-in failed. Please try again.');
        } finally {
            setGoogleLoading(false);
        }
    };

    return (
        <AuthLayout>
            <motion.div
                key={shakeKey}
                initial={false}
                animate={shakeKey > 0 ? { x: [0, -9, 9, -7, 7, -4, 4, 0] } : {}}
                transition={shakeKey > 0 ? { duration: 0.45 } : {}}
            >
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
                        Welcome back
                    </h2>
                    <p className="mt-1.5 text-[14px]" style={{ color: 'var(--sys-text-secondary)' }}>
                        Sign in to your MekeshBuilds dashboard
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
                        placeholder="owner@mekeshbuilds.dev"
                        error={errors.email?.message}
                        disabled={isLoading || isLockedOut}
                        autoComplete="email"
                        {...register('email')}
                    />

                    <div>
                        <FormInput
                            label="Password"
                            icon="lock_outline"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter your password"
                            error={errors.password?.message}
                            disabled={isLoading || isLockedOut}
                            autoComplete="current-password"
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
                        <div className="mt-2 flex justify-between items-center">
                            <Link
                                to="/auth/forgot-password"
                                className="text-[13px] font-semibold transition-all hover:translate-x-[2px]"
                                style={{
                                    color: 'var(--sys-accent)',
                                    pointerEvents: isLoading || googleLoading ? 'none' : 'auto',
                                    opacity: isLoading || googleLoading ? 0.75 : 1
                                }}
                            >
                                Forgot password?
                            </Link>

                            <Link
                                to="/auth/register"
                                className="text-[13px] font-semibold transition-all hover:-translate-x-[2px] text-sys-text-secondary hover:text-sys-text-primary"
                                style={{
                                    pointerEvents: isLoading || googleLoading ? 'none' : 'auto',
                                }}
                            >
                                Create an account
                            </Link>
                        </div>
                    </div>

                    <motion.button
                        type="submit"
                        disabled={isLoading || submitSuccess || isLockedOut}
                        whileHover={!isLoading && !isLockedOut ? { scale: 1.02, y: -1 } : {}}
                        whileTap={!isLoading && !isLockedOut ? { scale: 0.98 } : {}}
                        className="relative flex h-12 w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl text-[15px] font-bold text-white transition-all"
                        style={{
                            background: submitSuccess ? 'var(--sys-success)' : 'linear-gradient(135deg, var(--sys-accent) 0%, var(--sys-accent-dark) 100%)',
                            boxShadow: submitSuccess ? '0 4px 20px rgba(34,197,94,0.4)' : '0 4px 20px rgba(255,107,44,0.35)',
                            opacity: isLoading || isLockedOut ? 0.65 : 1,
                            cursor: isLoading || isLockedOut ? 'not-allowed' : 'pointer',
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
                            {isLockedOut ? `Locked (${remainingTime}m remaining)` : isLoading ? 'Signing in…' : submitSuccess ? 'Success!' : 'Sign In'}
                        </span>
                        {!isLoading && !submitSuccess && !isLockedOut && <span className="material-icons-round text-[18px]">arrow_forward</span>}
                    </motion.button>
                </motion.form>

                {/* Divider */}
                <motion.div
                    className="my-6 flex items-center gap-3 w-full"
                    variants={fadeUp(0.22)} initial="hidden" animate="visible"
                >
                    <div className="h-px flex-1" style={{ background: 'var(--sys-border)' }} />
                    <span className="text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: 'var(--sys-text-secondary)' }}>
                        or continue with
                    </span>
                    <div className="h-px flex-1" style={{ background: 'var(--sys-border)' }} />
                </motion.div>

                {/* Google CTA */}
                <motion.button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={googleLoading || isLoading}
                    variants={fadeUp(0.28)} initial="hidden" animate="visible"
                    whileHover={{ scale: 1.02, borderColor: 'var(--sys-accent)' }}
                    whileTap={{ scale: 0.98 }}
                    className="flex h-12 w-full items-center justify-center gap-3 rounded-xl text-[14px] font-semibold transition-all"
                    style={{
                        background: 'var(--sys-bg-tertiary)',
                        border: '1.5px solid var(--sys-border)',
                        color: 'var(--sys-text-primary)',
                        cursor: googleLoading || isLoading ? 'not-allowed' : 'pointer',
                        opacity: googleLoading ? 0.75 : 1,
                    }}
                >
                    {googleLoading ? <Spinner size={16} color="var(--sys-text-secondary)" /> : <GoogleLogo />}
                    {googleLoading ? 'Redirecting…' : 'Continue with Google'}
                </motion.button>

                {/* Trust footer */}
                <motion.div
                    className="mt-8 flex items-center justify-center gap-2"
                    variants={fadeUp(0.36)} initial="hidden" animate="visible"
                >
                    <span style={{ color: 'var(--sys-text-secondary)' }}>
                        <ShieldIcon />
                    </span>
                    <p className="text-[12px] font-medium" style={{ color: 'var(--sys-text-secondary)' }}>
                        Secure authentication · Admin/Owner access only
                    </p>
                </motion.div>
            </motion.div>
        </AuthLayout>
    );
};
