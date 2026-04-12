'use client';

import React from 'react';
import { createRoot } from 'react-dom/client';
import ReceiptTemplate from '@/components/ReceiptTemplate';
import { BarcodeLabelTemplate } from '@/components/inventory/BarcodeLabelTemplate';

/**
 * Renders a receipt in a hidden iframe to isolate it and triggers printing.
 */
export const printOrderReceipt = (tenant: any, order: any, settings: any) => {
    if (typeof window === 'undefined') return;

    // Remove existing iframe if any
    const existingIframe = document.getElementById('print-iframe');
    if (existingIframe) existingIframe.remove();

    // Create a hidden iframe
    const iframe = document.createElement('iframe');
    iframe.id = 'print-iframe';
    iframe.style.position = 'fixed';
    iframe.style.right = '100vw';
    iframe.style.bottom = '100vh';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    // Create container in iframe
    const head = doc.head;
    const body = doc.body;

    // Inject styles from main document
    const styles = document.querySelectorAll('link[rel="stylesheet"], style');
    styles.forEach(style => head.appendChild(style.cloneNode(true)));

    const container = doc.createElement('div');
    body.appendChild(container);

    const root = createRoot(container);
    root.render(<ReceiptTemplate tenant={tenant} order={order} settings={settings} />);

    // Wait for content and resources (especially images/fonts) to load
    iframe.onload = () => {
        // This won't trigger for programmatic content updates, so we use a safe timeout
    };

    setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();

        // Final cleanup after print dialog is handled
        setTimeout(() => {
            root.unmount();
            iframe.remove();
        }, 500);
    }, 800);
};

/**
 * Renders product barcode labels in a hidden iframe and triggers printing.
 */
export const printBarcodeLabel = async (product: any, settings: any) => {
    if (typeof window === 'undefined') return;

    // Remove existing iframe if any
    const existingIframe = document.getElementById('print-barcode-iframe');
    if (existingIframe) existingIframe.remove();

    // Create a hidden iframe
    const iframe = document.createElement('iframe');
    iframe.id = 'print-barcode-iframe';
    iframe.style.position = 'fixed';
    iframe.style.right = '100vw';
    iframe.style.bottom = '100vh';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    // Create container in iframe
    const head = doc.head;
    const body = doc.body;

    // Inject styles from main document
    const styles = document.querySelectorAll('link[rel="stylesheet"], style');
    styles.forEach(style => head.appendChild(style.cloneNode(true)));

    const container = doc.createElement('div');
    body.appendChild(container);

    const root = createRoot(container);
    root.render(<BarcodeLabelTemplate product={product} settings={settings} />);

    // Short delay to ensure SVG renders before opening print dialog
    setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();

        setTimeout(() => {
            root.unmount();
            iframe.remove();
        }, 500);
    }, 500);
};
