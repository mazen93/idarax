'use client';

// Generic utility to export table data to CSV 
export const exportToCSV = (data: any[], filename: string, columnHeaders?: Record<string, string>) => {
    if (!data || !data.length) return;

    const keys = Object.keys(data[0]);

    // Format headers from keys if columnHeaders not provided
    // Example: "gross_sales" -> "Gross Sales"
    const formatHeader = (key: string) => {
        if (columnHeaders && columnHeaders[key]) return columnHeaders[key];
        return key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    const headers = keys.map(formatHeader);

    const csvContent = [
        headers.join(','),
        ...data.map(row => keys.map(fieldName => JSON.stringify(row[fieldName] ?? '')).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

// Generic utility to export table data to Excel (stubbed)
export const exportToExcel = (data: any[], filename: string, columnHeaders?: Record<string, string>) => {
    // In production, use `xlsx` or `exceljs` library here.
    // For now, it defaults to CSV logic for standard spreadsheet opening.
    console.log(`Exporting ${filename} to Excel...`);
    exportToCSV(data, filename, columnHeaders);
};

// Generic utility to export table data to PDF (stubbed)
export const exportToPDF = (data: any[], filename: string) => {
    // In production, use `jspdf` and `jspdf-autotable` here.
    console.log(`Exporting ${filename} to PDF...`);
    alert(`PDF generation utility called for ${filename}. Ensure jsPDF is installed.`);
};

// Integration endpoints (conceptual outlines based on spec)
export const integrations = {
    exportToQuickBooks: async (reportData: any) => {
        console.log('Syncing data to QuickBooks...');
        // Logic to hit backend API: /api/integration/qb/sync
        return true;
    },
    exportToXero: async (reportData: any) => {
        console.log('Syncing data to Xero...');
        // Logic to hit backend API: /api/integration/xero/sync
        return true;
    },
    exportToSage: async (reportData: any) => {
        console.log('Syncing data to Sage...');
        // Logic to hit backend API: /api/integration/sage/sync
        return true;
    }
};
