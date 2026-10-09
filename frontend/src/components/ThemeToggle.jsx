import React from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
    const { darkMode, toggleDarkMode } = useTheme();

    return (
        <button
            onClick={toggleDarkMode}
            className={`
                relative w-20 h-10 rounded-full p-1 cursor-pointer transition-colors duration-500 ease-in-out
                ${darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-sky-100 border border-sky-200'}
            `}
            aria-label="Toggle Dark Mode"
        >
            {/* Background Icons */}
            <div className="absolute inset-0 flex items-center justify-between px-2.5 pointer-events-none">
                <Sun className={`w-5 h-5 ${darkMode ? 'text-slate-600' : 'text-amber-500'}`} />
                <Moon className={`w-5 h-5 ${darkMode ? 'text-indigo-400' : 'text-slate-400'}`} />
            </div>

            {/* Sliding Thumb */}
            <motion.div
                layout
                transition={{ type: "spring", stiffness: 700, damping: 30 }}
                className={`
                    w-8 h-8 rounded-full shadow-lg transform flex items-center justify-center
                    ${darkMode ? 'bg-slate-900 translate-x-10' : 'bg-[var(--bg)] translate-x-0'}
                `}
                initial={false}
                animate={{ x: darkMode ? 40 : 0 }}
            >
                {/* Thumb Icon (Optional: Morphing or switching icon on thumb) */}
                <motion.div
                    initial={false}
                    animate={{ rotate: darkMode ? 360 : 0, scale: darkMode ? 0.8 : 1 }}
                >
                    {darkMode ? (
                        <Moon className="w-5 h-5 text-indigo-400 fill-current" />
                    ) : (
                        <Sun className="w-5 h-5 text-amber-500 fill-current" />
                    )}
                </motion.div>
            </motion.div>
        </button>
    );
};

export default ThemeToggle;
