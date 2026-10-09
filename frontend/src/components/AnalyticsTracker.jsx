import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const AnalyticsTracker = () => {
    const location = useLocation();

    useEffect(() => {
        // Mock sending page view to analytics service (e.g., GA4)
        console.log(`[Analytics] Page View: ${location.pathname}`);

        // Example integration with window.gtag if it were present:
        // if (window.gtag) {
        //     window.gtag('config', 'G-XXXXXXXXXX', {
        //         page_path: location.pathname,
        //     });
        // }
    }, [location]);

    return null; // Render nothing
};

export default AnalyticsTracker;
