import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

const SEO = ({ title, description, keywords, image, url }) => {
    const { t, i18n } = useTranslation();
    const siteTitle = 'DermaAI';
    const currentLang = i18n.language;

    const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
    const defaultDescription = t('about.missionText', 'AI-powered skin lesion detection and analysis.');
    const metaDescription = description || defaultDescription;

    return (
        <Helmet priorizetoeo>
            {/* Standard Metadata */}
            <title>{fullTitle}</title>
            <meta name="description" content={metaDescription} />
            <meta name="keywords" content={keywords || "skin cancer detection, AI dermatologist, melanoma scan, skin health, AI diagnosis"} />
            <meta name="author" content="DermaAI Team" />
            <html lang={currentLang} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content={url || window.location.href} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={metaDescription} />
            {image && <meta property="og:image" content={image} />}

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={url || window.location.href} />
            <meta property="twitter:title" content={fullTitle} />
            <meta property="twitter:description" content={metaDescription} />
            {image && <meta property="twitter:image" content={image} />}
        </Helmet>
    );
};

export default SEO;
