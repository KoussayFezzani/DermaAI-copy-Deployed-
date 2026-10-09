import React, { useState, useEffect, Suspense, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
import { ChevronUp } from 'lucide-react';

// Lazy-loaded pages
const HomePage       = React.lazy(() => import('./pages/HomePage'));
const ScanPage       = React.lazy(() => import('./pages/ScanPage'));
const LoginPage      = React.lazy(() => import('./pages/Login'));
const SignupPage      = React.lazy(() => import('./pages/Signup'));
const ForgotPassword  = React.lazy(() => import('./pages/ForgotPassword'));
const ResetPassword   = React.lazy(() => import('./pages/ResetPassword'));
const HistoryPage    = React.lazy(() => import('./pages/History'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const AdminLayout   = React.lazy(() => import('./components/layouts/AdminLayout'));
const Blog           = React.lazy(() => import('./pages/Blog'));
const Profile        = React.lazy(() => import('./pages/Profile'));
const Diseases       = React.lazy(() => import('./pages/Diseases'));
const Support        = React.lazy(() => import('./pages/Support'));
const About          = React.lazy(() => import('./pages/About'));
const LegalPage      = React.lazy(() => import('./pages/LegalPage'));

// Static imports
import FloatingChat     from './components/FloatingChat';
import Navbar           from './components/Navbar';
import Footer           from './components/Footer';
import DisclaimerBanner from './components/DisclaimerBanner';

// Removed ScrollBackground to use simple colors


// ─── SCROLL TO TOP FAB ──────────────────────────────────────────────────────
const ScrollToTop = () => {
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const toggle = () => setVisible(window.scrollY > 600);
        window.addEventListener('scroll', toggle, { passive: true });
        return () => window.removeEventListener('scroll', toggle);
    }, []);

    return (
        <AnimatePresence>
            {visible && (
                <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    style={{
                        position: 'fixed',
                        bottom: '2rem',
                        right: '2rem',
                        zIndex: 50,
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: 'var(--text)',
                        color: 'var(--bg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
                    }}
                >
                    <ChevronUp size={24} strokeWidth={3} />
                </motion.button>
            )}
        </AnimatePresence>
    );
};

const PageLoader = () => (
    <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-6">
            <div className="w-12 h-12 rounded-full border-4 border-[var(--bg)]/10 border-t-var(--bg) animate-spin" />
            <p className="kicker text-[var(--bg)]/40">Loading Experience…</p>
        </div>
    </div>
);

const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { user, loading } = useAuth();
    if (loading) return <PageLoader />;
    if (!user) return <Navigate to="/login" replace />;
    if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />;
    return children;
};

const AppLayout = ({ globalDiagnosis, setGlobalDiagnosis }) => {
    const location = useLocation();
    const isAdminArea = location.pathname.startsWith('/admin');

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.pathname]);

    return (
        <div className={`min-h-screen flex flex-col mx-auto w-full relative parallax-container`}>
            {!isAdminArea && (
                <div className="fixed top-0 left-0 right-0 z-[1100]">
                    <Navbar />
                    <DisclaimerBanner />
                </div>
            )}

            <main className={isAdminArea ? 'flex-1 overflow-hidden' : 'flex-grow relative z-10 pt-40'}>
                <Suspense fallback={<PageLoader />}>
                    <Routes>
                        <Route path="/"          element={<HomePage />} />
                        <Route path="/about"     element={<About />} />
                        <Route path="/diseases"  element={<Diseases />} />
                        <Route path="/support"   element={<Support />} />
                        <Route path="/blog"      element={<Blog />} />
                        <Route path="/login"     element={<LoginPage />} />
                        <Route path="/signup"    element={<SignupPage />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password" element={<ResetPassword />} />
                        <Route path="/privacy"    element={<LegalPage type="privacy" />} />
                        <Route path="/terms"      element={<LegalPage type="terms" />} />
                        <Route path="/cookies"    element={<LegalPage type="cookies" />} />
                        <Route path="/disclaimer" element={<LegalPage type="disclaimer" />} />
                        <Route path="/scan" element={<ProtectedRoute><ScanPage onResult={setGlobalDiagnosis} /></ProtectedRoute>} />
                        <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
                        <Route path="/admin/*" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
                            <Route index element={<Navigate to="overview" replace />} />
                            <Route path="overview" element={<AdminDashboard tab="overview" />} />
                            <Route path="analytics" element={<AdminDashboard tab="analytics" />} />
                            <Route path="systems" element={<AdminDashboard tab="systems" />} />
                            <Route path="users" element={<AdminDashboard tab="users" />} />
                            <Route path="exports" element={<AdminDashboard tab="exports" />} />
                        </Route>
                        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Suspense>
            </main>

            {!isAdminArea && <Footer />}
            {!isAdminArea && <FloatingChat diagnosisContext={globalDiagnosis} />}
            {!isAdminArea && <ScrollToTop />}
        </div>
    );
};

function App() {
    const [globalDiagnosis, setGlobalDiagnosis] = useState(null);

    return (
        <AuthProvider>
            <Router>
                <AppLayout
                    globalDiagnosis={globalDiagnosis}
                    setGlobalDiagnosis={setGlobalDiagnosis}
                />
            </Router>
        </AuthProvider>
    );
}

export default App;

