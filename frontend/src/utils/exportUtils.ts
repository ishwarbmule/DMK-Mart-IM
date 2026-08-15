import confetti from 'canvas-confetti';

export interface ExportColumn<T = any> {
  header: string;
  key: string;
  format?: (value: any, row: T) => string | number;
  width?: number; // In characters/pixels for Excel
  align?: 'left' | 'center' | 'right';
}

export interface ExportOptions<T = any> {
  filename: string;
  title: string;
  companyName?: string;
  companyGstin?: string;
  subtitle?: string;
  columns: ExportColumn<T>[];
  data: T[];
  summaryRows?: Array<{
    label: string;
    values: Record<string, string | number>;
  }>;
}

/**
 * Escapes a cell value for standard RFC-4180 CSV compliance
 */
function escapeCsvValue(val: any): string {
  if (val === null || val === undefined) {
    return '""';
  }
  const str = String(val);
  // If value starts with =, +, -, @, prefix with a quote or apostrophe to prevent CSV formula injection
  let sanitized = str;
  if (/^[=+\-@]/.test(sanitized)) {
    sanitized = `'${sanitized}`;
  }
  if (sanitized.includes('"') || sanitized.includes(',') || sanitized.includes('\n') || sanitized.includes('\r')) {
    return `"${sanitized.replace(/"/g, '""')}"`;
  }
  return `"${sanitized}"`;
}

/**
 * Clean and sanitize a filename for all operating systems (Windows/Mac/Linux)
 * Strips illegal characters: / \ : * ? " < > | and ensures proper extension
 */
function sanitizeFilename(raw: string, defaultExt: string): string {
  if (!raw || typeof raw !== 'string') {
    return `DMK_Export_${Date.now()}.${defaultExt}`;
  }

  // Remove any existing extension first to prevent double extensions like .xls.xls or .csv.xls
  let base = raw.replace(/\.(csv|xls|xlsx|txt)$/i, '');

  // Strip illegal OS characters and replace with underscore
  base = base.replace(/[/\\?%*:|"<>]/g, '_').trim();
  
  // Replace consecutive underscores/spaces
  base = base.replace(/[\s_]+/g, '_');

  // Strip trailing dots
  base = base.replace(/\.+$/, '');

  const ext = defaultExt.toLowerCase().replace(/^\./, '');
  return `${base}.${ext}`;
}

/**
 * Trigger robust browser file download via Blob URL
 * Uses asynchronous URL revocation so Chromium / Edge / Safari don't truncate or cancel the stream
 */
function downloadBlob(blob: Blob, rawFilename: string, defaultExt: string) {
  const safeFilename = sanitizeFilename(rawFilename, defaultExt);
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.style.display = 'none';
  link.href = url;
  link.download = safeFilename;
  link.setAttribute('download', safeFilename);
  
  // Required for Firefox & older Chromium
  document.body.appendChild(link);
  
  // Trigger click
  link.click();
  
  // Delay removing element and revoking URL so browser's background download manager finishes fetching
  setTimeout(() => {
    try {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
      URL.revokeObjectURL(url);
    } catch (err) {
      // Ignore cleanup errors
    }
  }, 1500);

  // Trigger celebration micro-confetti
  try {
    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.8 },
      colors: ['#FF6B00', '#10B981', '#00E5FF']
    });
  } catch (err) {
    // Ignore confetti if not loaded
  }
}

/**
 * Export structured data as RFC-4180 CSV with UTF-8 BOM for instant Microsoft Excel compatibility
 */
export function exportToCSV<T = any>(options: ExportOptions<T>): void {
  const {
    filename,
    title,
    companyName = 'DMK Mart Multi-Company Manufacturing Platform',
    companyGstin,
    subtitle,
    columns,
    data,
    summaryRows = []
  } = options;

  const now = new Date();
  const timestampStr = `${now.toLocaleDateString('en-IN')} ${now.toLocaleTimeString('en-IN')}`;

  const csvRows: string[] = [];

  // 1. Metadata Header Section
  csvRows.push(escapeCsvValue(companyName.toUpperCase()));
  if (companyGstin) {
    csvRows.push(`${escapeCsvValue('GSTIN / Tax ID:')},${escapeCsvValue(companyGstin)}`);
  }
  csvRows.push(`${escapeCsvValue('Document / Report:')},${escapeCsvValue(title)}`);
  if (subtitle) {
    csvRows.push(`${escapeCsvValue('Scope / Notes:')},${escapeCsvValue(subtitle)}`);
  }
  csvRows.push(`${escapeCsvValue('Export Timestamp:')},${escapeCsvValue(timestampStr)}`);
  csvRows.push(`${escapeCsvValue('Total Record Count:')},${escapeCsvValue(data.length)}`);
  csvRows.push(''); // Blank separator line

  // 2. Column Headers
  const headerRow = columns.map(c => escapeCsvValue(c.header)).join(',');
  csvRows.push(headerRow);

  // 3. Data Rows
  data.forEach((row) => {
    const rowValues = columns.map(c => {
      let rawVal = (row as any)[c.key];
      if (c.format) {
        rawVal = c.format(rawVal, row);
      }
      return escapeCsvValue(rawVal);
    });
    csvRows.push(rowValues.join(','));
  });

  // 4. Summary Rows (Totals / Aggregates)
  if (summaryRows.length > 0) {
    csvRows.push(''); // Blank separator
    summaryRows.forEach(sRow => {
      const summaryLine = columns.map((c, idx) => {
        if (idx === 0) {
          return escapeCsvValue(`SUMMARY: ${sRow.label}`);
        }
        if (sRow.values[c.key] !== undefined) {
          return escapeCsvValue(sRow.values[c.key]);
        }
        return '""';
      });
      csvRows.push(summaryLine.join(','));
    });
  }

  // UTF-8 BOM (\uFEFF) ensures Excel opens special characters (₹, accents) without encoding issues
  const csvContent = '\uFEFF' + csvRows.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  downloadBlob(blob, filename, 'csv');
}

/**
 * Export styled Microsoft Excel XML/HTML Workbook (.xls)
 * Creates an executive-styled workbook with brand colors, bold headers, formatted numbers, borders, and summary totals.
 */
export function exportToExcel<T = any>(options: ExportOptions<T>): void {
  const {
    filename,
    title,
    companyName = 'DMK Mart Multi-Company Manufacturing Platform',
    companyGstin,
    subtitle,
    columns,
    data,
    summaryRows = []
  } = options;

  const now = new Date();
  const timestampStr = `${now.toLocaleDateString('en-IN')} ${now.toLocaleTimeString('en-IN')}`;

  const colCount = columns.length;

  let html = `\uFEFF<html xmlns:o="urn:schemas-microsoft-com:office:office" 
        xmlns:x="urn:schemas-microsoft-com:office:excel" 
        xmlns="http://www.w3.org/TR/REC-html40">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <!--[if gte mso 9]>
    <xml>
      <x:ExcelWorkbook>
        <x:ExcelWorksheets>
          <x:ExcelWorksheet>
            <x:Name>${title.substring(0, 31).replace(/[/\\?*:[\]]/g, '')}</x:Name>
            <x:WorksheetOptions>
              <x:DisplayGridlines/>
            </x:WorksheetOptions>
          </x:ExcelWorksheet>
        </x:ExcelWorksheets>
      </x:ExcelWorkbook>
    </xml>
    <![endif]-->
    <style>
      body {
        font-family: 'Segoe UI', Calibri, Arial, sans-serif;
        color: #1F2937;
        margin: 15px;
        background-color: #FFFFFF;
      }
      table {
        border-collapse: collapse;
        width: 100%;
        margin-top: 10px;
        font-size: 11pt;
      }
      th {
        background-color: #0A0C10;
        color: #FFFFFF;
        font-weight: bold;
        text-align: left;
        padding: 10px 12px;
        border: 1px solid #374151;
        white-space: nowrap;
      }
      td {
        padding: 8px 12px;
        border: 1px solid #E5E7EB;
        color: #1F2937;
      }
      tr:nth-child(even) td {
        background-color: #F9FAFB;
      }
      .company-banner {
        background-color: #FF6B00;
        color: #FFFFFF;
        font-size: 18pt;
        font-weight: 900;
        padding: 14px 16px;
        text-align: left;
      }
      .meta-label {
        font-weight: bold;
        color: #4B5563;
        width: 180px;
        background-color: #F3F4F6;
      }
      .meta-val {
        color: #111827;
        font-weight: 600;
      }
      .align-left { text-align: left; }
      .align-center { text-align: center; }
      .align-right { 
        text-align: right; 
        mso-number-format: "\\#\\,\\#\\#0\\.00"; 
      }
      .summary-tr td {
        background-color: #FEF3C7 !important;
        color: #92400E !important;
        font-weight: bold !important;
        border-top: 2px solid #F59E0B !important;
        border-bottom: 2px solid #F59E0B !important;
        font-size: 11pt;
      }
      .summary-label {
        font-weight: 800 !important;
      }
      .footer-note {
        margin-top: 16px;
        font-size: 9pt;
        color: #6B7280;
        font-style: italic;
      }
    </style>
  </head>
  <body>
    <table>
      <thead>
        <tr>
          <th colspan="${colCount}" class="company-banner">
            ${companyName.toUpperCase()}
          </th>
        </tr>
        ${companyGstin ? `
          <tr>
            <td class="meta-label">GSTIN / Tax ID:</td>
            <td colspan="${colCount - 1}" class="meta-val">${companyGstin}</td>
          </tr>
        ` : ''}
        <tr>
          <td class="meta-label">Document / Report:</td>
          <td colspan="${colCount - 1}" class="meta-val">${title}</td>
        </tr>
        ${subtitle ? `
          <tr>
            <td class="meta-label">Scope / Filter:</td>
            <td colspan="${colCount - 1}" class="meta-val">${subtitle}</td>
          </tr>
        ` : ''}
        <tr>
          <td class="meta-label">Export Timestamp:</td>
          <td colspan="${colCount - 1}" class="meta-val">${timestampStr}</td>
        </tr>
        <tr>
          <td class="meta-label">Total Records:</td>
          <td colspan="${colCount - 1}" class="meta-val">${data.length} Entries</td>
        </tr>
        <tr><td colspan="${colCount}" style="border:none; height:10px;"></td></tr>
        
        <!-- Table Column Headers -->
        <tr>
          ${columns.map(c => `
            <th class="align-${c.align || 'left'}" style="${c.width ? `width: ${c.width * 9}px;` : ''}">
              ${c.header}
            </th>
          `).join('')}
        </tr>
      </thead>
      <tbody>
        <!-- Data Rows -->
        ${data.map(row => `
          <tr>
            ${columns.map(c => {
              let val = (row as any)[c.key];
              if (c.format) {
                val = c.format(val, row);
              }
              const isNum = c.align === 'right' || typeof val === 'number';
              return `
                <td class="align-${c.align || 'left'} ${isNum ? 'num-val' : ''}">
                  ${val !== undefined && val !== null ? val : ''}
                </td>
              `;
            }).join('')}
          </tr>
        `).join('')}

        <!-- Summary Totals Rows -->
        ${summaryRows.map(sRow => `
          <tr class="summary-tr">
            <td class="summary-label" style="text-align: left;">
              ${sRow.label.toUpperCase()}
            </td>
            ${columns.slice(1).map(c => {
              const val = sRow.values[c.key];
              return `
                <td class="summary-val align-${c.align || 'right'} num-val">
                  ${val !== undefined ? val : ''}
                </td>
              `;
            }).join('')}
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="footer-note">
      Confidential • Official data export generated by DMK Mart Multi-Company Enterprise ERP • System Time: ${timestampStr}
    </div>
  </body>
  </html>
  `;

  const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8' });
  downloadBlob(blob, filename, 'xls');
}
