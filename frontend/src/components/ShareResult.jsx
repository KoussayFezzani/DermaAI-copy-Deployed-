import React, { useState } from 'react';
import { Share2, Check, Copy } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ShareResult = ({ diagnosis, confidence, description }) => {
    const { t } = useTranslation();
    const [copied, setCopied] = useState(false);

    const shareData = {
        title: 'DermaAI Scan Result',
        text: `I just scanned a skin lesion with DermaAI.\nResult: ${diagnosis} (${(confidence * 100).toFixed(1)}% confidence).\n${description}`,
        url: window.location.href
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.error('Error sharing:', err);
            }
        } else {
            // Fallback to clipboard
            try {
                await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (err) {
                console.error('Failed to copy:', err);
            }
        }
    };

    return (
        <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-[var(--bg)] rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            aria-label={t('share_result', 'Share Result')}
        >
            {copied ? <Check size={18} /> : navigator.share ? <Share2 size={18} /> : <Copy size={18} />}
            <span>{copied ? t('copied', 'Copied!') : t('share', 'Share Result')}</span>
        </button>
    );
};

export default ShareResult;
