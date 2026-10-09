import jsPDF from 'jspdf';
import ArabicReshaperModule from 'arabic-persian-reshaper';
const ArabicShaper = ArabicReshaperModule.ArabicShaper || (ArabicReshaperModule.default && ArabicReshaperModule.default.ArabicShaper) || ArabicReshaperModule;
import { API_BASE_URL } from './apiConfig';

// Arabic font kept for RTL support
const CAIRO_REGULAR = "AAEAAAAQAQAABAAAR0RFRvMH1KkAAQdgAAACwEdQT1MrXedQAAEKIAAAX/BHU1VCl2is1gABahAAAA84T1MvMqlljaMAANV0AAAAYFNUQVTxW9k1AAF5SAAAAERjbWFw5822fAAA1dQAAAlYZ2FzcAAAABAAAQdYAAAACGdseWZ1i58XAAABDAAAwJZoZWFkIm7eQAAAyDgAAAA2aGhlYQq9BmEAANVQAAAAJGhtdHhEUWI+AADIcAAADN5sb2NhEefhPAAAwcQAAAZybWF4cANWAQcAAMGkAAAAIG5hbWUhgic1AADfNAAAB+Jwb3N0tbkqWgAA5xgAACA9cHJlcGgGjgUAAN8sAAAABw==";

const BASE_URL = API_BASE_URL;


// ── Design tokens matching website ──────────────────────────────────────────
const NAVY  = [15, 27, 45];       // #0f1b2d
const MUTED = [107, 114, 128];    // #6b7280
const TEAL  = [29, 158, 117];     // #1D9E75
const RED   = [220, 38, 38];      // #DC2626
const AMBER = [217, 119, 6];      // #D97706
const WHITE = [255, 255, 255];

function getRiskColor(diagnosis = '') {
    const d = diagnosis.toLowerCase();
    if (d.includes('malignant')) return {
        color: RED,  label: 'High Risk',
        pillFg: [163, 45, 45],     // #A32D2D
        pillBg: [252, 235, 235],   // #FCEBEB
    };
    if (d.includes('actinic') || d.includes('melanoma')) return {
        color: AMBER, label: 'Moderate Risk',
        pillFg: [133, 79, 11],     // #854F0B
        pillBg: [250, 238, 218],   // #FAEEDA
    };
    return {
        color: TEAL, label: 'Low Risk',
        pillFg: [8, 80, 65],       // #085041
        pillBg: [225, 245, 238],   // #E1F5EE
    };
}

function fetchImageAsBase64(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            canvas.getContext('2d').drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/jpeg', 0.92));
        };
        img.onerror = () => reject(new Error(`Failed to load image from ${url}`));
        img.src = url;
    });
}

// ── Main export ──────────────────────────────────────────────────────────────
export const generatePDFReport = async (item, t, diseaseData, currentLang, recommendations = []) => {
    const doc  = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const W    = doc.internal.pageSize.getWidth();   // 210
    const H    = doc.internal.pageSize.getHeight();  // 297
    const ML   = 18;   // left margin
    const MR   = 18;   // right margin
    const CW   = W - ML - MR;  // content width
    const isAr = currentLang === 'ar';

    // Arabic font setup
    doc.addFileToVFS('Cairo-Regular.ttf', CAIRO_REGULAR);
    doc.addFont('Cairo-Regular.ttf', 'Cairo', 'normal');

    const font = (weight = 'normal') =>
        isAr ? doc.setFont('Cairo', 'normal') : doc.setFont('helvetica', weight);

    const txt = (text) => {
        if (!text) return '';
        if (isAr) {
            try {
                if (ArabicShaper && typeof ArabicShaper.convertArabic === 'function') {
                    return ArabicShaper.convertArabic(text);
                }
                return text;
            } catch {
                return text;
            }
        }
        return text;
    };

    const write = (text, x, y, opts = {}) => {
        if (isAr && !opts.align) { opts.align = 'right'; x = W - x; }
        doc.text(txt(text), x, y, opts);
    };

    // ── Accent bar (left edge, full page height) ─────────────────────────
    doc.setFillColor(15, 27, 45);
    doc.rect(0, 0, 4, H, 'F');

    let y = 0;

    // ── HEADER ───────────────────────────────────────────────────────────
    y = 18;
    font('bold');
    doc.setFontSize(22);
    doc.setTextColor(...NAVY);
    write('DermaAI', ML + 4, y);

    font('normal');
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.setCharSpace(1.5);
    write('DIAGNOSTIC REPORT', ML + 4, y + 7);
    doc.setCharSpace(0);

    // Top-right: date
    const reportDate = new Date(item.timestamp || Date.now())
        .toLocaleString(isAr ? 'ar-EG' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' });
    font('normal');
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(reportDate, W - MR, y, { align: 'right' });

    // Divider
    y += 14;
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.4);
    doc.line(ML, y, W - MR, y);

    // ── SECTION 1: PATIENT IMAGE ─────────────────────────────────────────
    y += 10;
    const imgW = 70;
    const imgH = 70;
    const imgX = ML + 4;

    try {
        const imageUrl = (item.image_url?.startsWith('http')) ? item.image_url : `${BASE_URL}${item.image_url}`;
        const imgData = await fetchImageAsBase64(imageUrl);
        doc.addImage(imgData, 'JPEG', imgX, y, imgW, imgH, undefined, 'FAST');
        // subtle border
        doc.setDrawColor(229, 231, 235);
        doc.setLineWidth(0.3);
        doc.rect(imgX, y, imgW, imgH, 'S');
        // label below
        font('normal');
        doc.setFontSize(8);
        doc.setTextColor(...MUTED);
        write('Submitted image', imgX, y + imgH + 5);
        y += imgH + 12;
    } catch {
        y += 6;
    }

    // Divider
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.4);
    doc.line(ML, y, W - MR, y);

    // ── SECTION 2: DIAGNOSIS RESULTS ─────────────────────────────────────
    y += 10;
    const riskMeta  = getRiskColor(item.diagnosis || '');
    const primary   = (item.diagnosis || 'Unknown').split(',')[0].trim();
    const secondary = (item.diagnosis_2 || '').split(',')[0].trim();
    const confPct   = ((item.confidence || 0) * 100).toFixed(1);
    const conf2Pct  = ((item.confidence_2 || 0) * 100).toFixed(1);

    // Primary diagnosis — large bold
    font('bold');
    doc.setFontSize(16);
    doc.setTextColor(...NAVY);
    write(primary, ML + 4, y, { maxWidth: CW - 30 });

    // Confidence score
    y += 8;
    font('normal');
    doc.setFontSize(11);
    doc.setTextColor(...MUTED);
    write(`${confPct}% confidence`, ML + 4, y);

    // Risk pill — filled background
    const pillX = W - MR - 42;
    const pillY = y - 13;
    doc.setFillColor(...riskMeta.pillBg);
    doc.setDrawColor(...riskMeta.pillBg);
    doc.setLineWidth(0);
    doc.roundedRect(pillX, pillY, 40, 8, 2, 2, 'F');
    font('bold');
    doc.setFontSize(7);
    doc.setTextColor(...riskMeta.pillFg);
    doc.text(riskMeta.label, pillX + 20, pillY + 5.5, { align: 'center' });

    // Secondary match
    if (secondary) {
        y += 8;
        font('normal');
        doc.setFontSize(9);
        doc.setTextColor(...MUTED);
        write(`Secondary: ${secondary} — ${conf2Pct}%`, ML + 4, y);
    }

    y += 10;
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.4);
    doc.line(ML, y, W - MR, y);

    // ── SECTION 3: CLINICAL GUIDANCE ─────────────────────────────────────
    y += 10;
    font('bold');
    doc.setFontSize(11);
    doc.setTextColor(...NAVY);
    write('Clinical Guidance', ML + 4, y);
    y += 8;

    const recs = recommendations.length > 0 ? recommendations : ['Consult a dermatologist for a full assessment.'];
    font('normal');
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);

    recs.forEach((rec, i) => {
        // Bullet dot — navy
        doc.setFillColor(...NAVY);
        doc.circle(ML + 7, y - 1.2, 1.2, 'F');
        const lines = doc.splitTextToSize(txt(rec), CW - 14);
        doc.text(lines, ML + 11, y, { align: isAr ? 'right' : 'left' });
        y += lines.length * 5 + 2;
    });

    // ── Centered footer line between guidance and disclaimer ──────────────
    const footerLineY = H - 10 - 30 - 8 - 10;  // above disclaimer
    font('normal');
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);  // #9ca3af
    doc.text('Generated by DermaAI · dermaai.com', W / 2, footerLineY, { align: 'center' });

    // ── SECTION 4: DISCLAIMER (amber box, always last, never clipped) ─────
    // Ensure it fits — move to new page if needed
    const discH = 30;
    const footerH = 10;
    const discY = H - footerH - discH - 8;

    // Amber disclaimer box
    doc.setFillColor(255, 251, 235);
    doc.setDrawColor(253, 230, 138);
    doc.setLineWidth(0.4);
    doc.roundedRect(ML, discY, CW, discH, 2, 2, 'FD');

    font('bold');
    doc.setFontSize(8);
    doc.setTextColor(146, 64, 14);   // amber-800
    write('Medical Disclaimer', ML + 5, discY + 7);

    font('normal');
    doc.setFontSize(7.5);
    doc.setTextColor(180, 83, 9);    // amber-700
    const discText = 'DermaAI provides AI-based estimation for informational purposes only and does not constitute a clinical diagnosis. Results represent statistical probability. Always consult a qualified dermatologist or healthcare professional before making any medical decisions.';
    const discLines = doc.splitTextToSize(txt(discText), CW - 10);
    doc.text(discLines, isAr ? W - ML - 5 : ML + 5, discY + 13, { align: isAr ? 'right' : 'left' });

    // ── FOOTER ────────────────────────────────────────────────────────────
    doc.setFillColor(248, 250, 252);
    doc.rect(0, H - footerH, W, footerH, 'F');
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.3);
    doc.line(0, H - footerH, W, H - footerH);

    font('normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...MUTED);
    doc.text('Generated by DermaAI · dermaai.com', W / 2, H - 3.5, { align: 'center' });

    const scanId = item._id ? item._id.slice(-8).toUpperCase() : 'NEW';
    doc.save(`DermaAI_Report_${scanId}.pdf`);
};

// ── Comparison PDF (unchanged) ───────────────────────────────────────────────
export const generateComparisonPDF = async (item1, item2, t, diseaseData, currentLang) => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const W = doc.internal.pageSize.getWidth();
    const margin = 20;
    const colW = (W - margin * 3) / 2;

    doc.setFillColor(...TEAL);
    doc.rect(0, 0, W, 30, 'F');
    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.text('Longitudinal Progression Report', margin, 20);

    const drawColumn = async (item, x, dateLabel) => {
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(14);
        doc.text(dateLabel, x, 50);
        doc.setFontSize(10);
        doc.text(`Date: ${new Date(item.timestamp).toLocaleDateString()}`, x, 60);
        doc.text(`Diagnosis: ${item.diagnosis.split(',')[0]}`, x, 68);
        doc.text(`Confidence: ${(item.confidence * 100).toFixed(1)}%`, x, 76);
        if (item.body_part) doc.text(`Location: ${item.body_part}`, x, 84);
        try {
            const imageUrl = item.image_url?.startsWith('http') ? item.image_url : `${BASE_URL}${item.image_url}`;
            const imgData = await fetchImageAsBase64(imageUrl);
            doc.addImage(imgData, 'JPEG', x, 95, colW - 20, colW - 20);
        } catch (e) {}
    };

    const items = [item1, item2].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    await drawColumn(items[0], margin, 'Baseline Scan');
    await drawColumn(items[1], margin + colW + margin, 'Follow-up Scan');

    const confDiff = items[1].confidence - items[0].confidence;
    const isSameDiag = items[1].diagnosis.split(',')[0] === items[0].diagnosis.split(',')[0];
    let diffText = 'Status remains stable. Continue regular monitoring.';
    if (confDiff > 0.05 && isSameDiag) diffText = 'WARNING: Confidence for this lesion has INCREASED since baseline.';
    else if (!isSameDiag) diffText = 'NOTICE: Primary diagnosis has deviated from baseline.';
    doc.setTextColor(confDiff > 0.05 ? 220 : 29, confDiff > 0.05 ? 38 : 158, confDiff > 0.05 ? 38 : 117);
    doc.text(diffText, margin, 190);

    doc.save(`DermaAI_Comparison_${items[0]._id?.slice(-4)}_${items[1]._id?.slice(-4)}.pdf`);
};
