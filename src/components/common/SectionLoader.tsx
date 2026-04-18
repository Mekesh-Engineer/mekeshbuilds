import { memo } from 'react';
import { motion } from 'framer-motion';

const SectionLoader = () => (
    <div className="flex h-[400px] w-full flex-col items-center justify-center gap-6 bg-sys-bg-primary py-24">
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: [0.5, 1, 0.5], scale: [0.95, 1.02, 0.95] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="relative h-16 w-16"
        >
            <div className="absolute inset-0 rounded-full border-4 border-sys-border border-t-sys-accent bg-transparent animate-spin" />
            <div className="absolute inset-2 rounded-full border-4 border-sys-border border-b-sys-accent-light bg-transparent animate-[spin_3s_linear_infinite]" />
        </motion.div>
        <motion.div
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="text-sm font-bold uppercase tracking-widest text-sys-text-secondary"
        >
            Loading Section...
        </motion.div>
    </div>
);

export default memo(SectionLoader);

