import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const SundialToggle = () => {
    const { darkMode, toggleDarkMode } = useTheme();

    return (
        <button
            onClick={toggleDarkMode}
            className="relative w-16 h-8 rounded-full bg-slate-200 dark:bg-slate-800 p-1 flex items-center transition-colors duration-500 overflow-hidden shadow-inner"
        >
            <motion.div
                animate={{
                    x: darkMode ? 32 : 0,
                    rotate: darkMode ? 360 : 0,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="z-10 w-6 h-6 rounded-full bg-[var(--bg)] dark:bg-slate-900 shadow-md flex items-center justify-center text-amber-500 dark:text-blue-400"
            >
                {darkMode ? <Moon size={14} /> : <Sun size={14} />}
            </motion.div>

            {/* Decorative background rays */}
            <AnimatePresence>
                {!darkMode && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="absolute left-2 text-amber-500/20"
                    >
                        <div className="w-4 h-4 rounded-full border border-current animate-ping" />
                    </motion.div>
                )}
            </AnimatePresence>
        </button>
    );
};


export default SundialToggle;
