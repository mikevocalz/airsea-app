import { InventoryReport, InventoryItem } from '@/types';
import { generateQRSvg } from './qrcode';

const ITEMS_PER_PAGE = 12;

function generateQRDataUrl(value: string, size: number = 60): string {
  const svg = generateQRSvg(value, size, '#1a1a1a', '#ffffff');
  try {
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  } catch {
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  }
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function generateTableRows(items: InventoryItem[]): string {
  return items.map((item, index) => {
    const bgColor = index % 2 === 1 ? '#f8f8f8' : '#ffffff';
    const qrCode = item.handlingVideo 
      ? `<img src="${generateQRDataUrl(item.handlingVideo.qrValue, 50)}" width="50" height="50" />`
      : '<span style="color: #999;">—</span>';
    
    return `
      <tr style="background-color: ${bgColor};">
        <td class="item-col">${item.itemNumber}</td>
        <td class="qty-col">${item.quantity}</td>
        <td class="pcs-col">${item.pieces}</td>
        <td class="desc-col">
          <div class="desc-text">${item.description}</div>
          ${item.sidemark ? `<div class="sidemark">SM: ${item.sidemark}</div>` : ''}
        </td>
        <td class="room-col">${item.room || '—'}</td>
        <td class="qr-col">${qrCode}</td>
      </tr>
    `;
  }).join('');
}

function generateDetailPage(item: InventoryItem, report: InventoryReport): string {
  if (!item.media?.photoUrl && !item.notes) return '';
  
  const qrCode = item.handlingVideo 
    ? `<img src="${generateQRDataUrl(item.handlingVideo.qrValue, 120)}" width="120" height="120" />`
    : '';

  return `
    <div class="detail-page page-break">
      <div class="detail-header">
        <h2>Item Detail</h2>
        <div class="detail-meta">
          <span class="item-number">${item.itemNumber}</span>
          <span class="job-ref">${report.job.jobNumber}</span>
        </div>
      </div>
      
      <div class="detail-content">
        <div class="detail-main">
          ${item.media?.photoUrl ? `
            <div class="detail-image-container">
              <img src="${item.media.photoUrl}" class="detail-image" />
            </div>
          ` : ''}
          
          <div class="detail-info">
            <h3>${item.description}</h3>
            
            <div class="detail-grid">
              <div class="detail-item">
                <label>Quantity</label>
                <span>${item.quantity}</span>
              </div>
              <div class="detail-item">
                <label>Pieces</label>
                <span>${item.pieces}</span>
              </div>
              <div class="detail-item">
                <label>Room</label>
                <span>${item.room || '—'}</span>
              </div>
              <div class="detail-item">
                <label>Sidemark</label>
                <span>${item.sidemark || '—'}</span>
              </div>
            </div>
            
            ${item.notes ? `
              <div class="detail-notes">
                <label>Handling Notes</label>
                <p>${item.notes}</p>
              </div>
            ` : ''}
          </div>
        </div>
        
        ${qrCode ? `
          <div class="detail-qr">
            <div class="qr-wrapper">
              ${qrCode}
            </div>
            <span class="qr-label">Scan for handling video</span>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

export function generateInventoryReportHTML(report: InventoryReport): string {
  const totalPages = Math.ceil(report.items.length / ITEMS_PER_PAGE);
  const itemsWithDetails = report.items.filter(item => item.media?.photoUrl || item.notes);
  const totalPagesWithDetails = totalPages + itemsWithDetails.length;
  
  let pagesHTML = '';
  
  for (let page = 0; page < totalPages; page++) {
    const pageItems = report.items.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);
    const pageNumber = page + 1;
    
    pagesHTML += `
      <div class="page ${page > 0 ? 'page-break' : ''}">
        <header class="report-header">
          <div class="header-left">
            ${report.company.logoUrl 
              ? `<img src="${report.company.logoUrl}" class="company-logo" />`
              : `<div class="company-name-large">${report.company.name.charAt(0)}</div>`
            }
            <div class="header-title">
              <h1>INVENTORY REPORT</h1>
              <p class="company-name">${report.company.name}</p>
            </div>
          </div>
          <div class="header-right">
            <div class="header-meta">
              <div class="meta-row"><label>Job #:</label><span>${report.job.jobNumber}</span></div>
              <div class="meta-row"><label>Client:</label><span>${report.job.client}</span></div>
              <div class="meta-row"><label>Project:</label><span>${report.job.projectName}</span></div>
              <div class="meta-row"><label>Reference:</label><span>${report.job.clientRef}</span></div>
              <div class="meta-row"><label>Generated:</label><span>${formatDate(report.meta.generatedAt)}</span></div>
            </div>
          </div>
        </header>
        
        <main class="report-content">
          <table class="inventory-table">
            <thead>
              <tr>
                <th class="item-col">Item #</th>
                <th class="qty-col">Qty</th>
                <th class="pcs-col">Pcs</th>
                <th class="desc-col">Description</th>
                <th class="room-col">Room</th>
                <th class="qr-col">Handling Video</th>
              </tr>
            </thead>
            <tbody>
              ${generateTableRows(pageItems)}
            </tbody>
          </table>
        </main>
        
        <footer class="report-footer">
          <div class="footer-left">
            <span>${report.company.name}</span>
            <span class="separator">·</span>
            <span>Confidential</span>
          </div>
          <div class="footer-right">
            <span>Page ${pageNumber} of ${totalPagesWithDetails}</span>
          </div>
        </footer>
      </div>
    `;
  }
  
  itemsWithDetails.forEach((item, index) => {
    pagesHTML += generateDetailPage(item, report);
  });

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Inventory Report - ${report.job.jobNumber}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          @page {
            size: A4;
            margin: 0;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
            font-size: 12px;
            color: #1a1a1a;
            line-height: 1.5;
            background: #ffffff;
          }
          
          .page {
            width: 210mm;
            min-height: 297mm;
            padding: 20mm;
            background: #ffffff;
            position: relative;
            display: flex;
            flex-direction: column;
          }
          
          .page-break {
            page-break-before: always;
          }
          
          .report-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding-bottom: 16px;
            border-bottom: 2px solid #1a1a1a;
            margin-bottom: 20px;
          }
          
          .header-left {
            display: flex;
            align-items: center;
            gap: 16px;
          }
          
          .company-logo {
            width: 48px;
            height: 48px;
            object-fit: contain;
            border-radius: 8px;
          }
          
          .company-name-large {
            width: 48px;
            height: 48px;
            background: #1a1a1a;
            color: #ffffff;
            font-size: 24px;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
          }
          
          .header-title h1 {
            font-size: 20px;
            font-weight: 700;
            letter-spacing: 2px;
            margin-bottom: 2px;
          }
          
          .header-title .company-name {
            font-size: 11px;
            color: #666;
            font-weight: 500;
          }
          
          .header-right {
            text-align: right;
          }
          
          .header-meta {
            display: flex;
            flex-direction: column;
            gap: 3px;
          }
          
          .meta-row {
            display: flex;
            justify-content: flex-end;
            gap: 8px;
            font-size: 10px;
          }
          
          .meta-row label {
            color: #666;
            font-weight: 500;
          }
          
          .meta-row span {
            color: #1a1a1a;
            font-weight: 600;
            min-width: 120px;
            text-align: left;
          }
          
          .report-content {
            flex: 1;
          }
          
          .inventory-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
          }
          
          .inventory-table thead tr {
            background: #1a1a1a;
          }
          
          .inventory-table th {
            color: #ffffff;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-size: 9px;
            padding: 10px 8px;
            text-align: left;
            border: none;
          }
          
          .inventory-table td {
            padding: 10px 8px;
            border-bottom: 1px solid #e5e5e5;
            vertical-align: middle;
          }
          
          .item-col { width: 70px; font-family: monospace; font-weight: 600; }
          .qty-col { width: 40px; text-align: center; }
          .pcs-col { width: 40px; text-align: center; }
          .desc-col { }
          .room-col { width: 80px; }
          .qr-col { width: 70px; text-align: center; }
          
          .desc-text {
            font-size: 11px;
            line-height: 1.4;
          }
          
          .sidemark {
            font-size: 9px;
            color: #666;
            font-family: monospace;
            margin-top: 3px;
          }
          
          .report-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-top: 16px;
            border-top: 1px solid #e5e5e5;
            margin-top: auto;
            font-size: 10px;
            color: #666;
          }
          
          .footer-left {
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .separator {
            color: #ccc;
          }
          
          /* Detail Page Styles */
          .detail-page {
            padding: 20mm;
          }
          
          .detail-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-bottom: 16px;
            border-bottom: 2px solid #1a1a1a;
            margin-bottom: 24px;
          }
          
          .detail-header h2 {
            font-size: 18px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          
          .detail-meta {
            display: flex;
            gap: 16px;
          }
          
          .detail-meta .item-number {
            font-family: monospace;
            font-size: 14px;
            font-weight: 700;
            background: #1a1a1a;
            color: #ffffff;
            padding: 4px 12px;
            border-radius: 4px;
          }
          
          .detail-meta .job-ref {
            font-size: 12px;
            color: #666;
            padding: 4px 12px;
            border: 1px solid #e5e5e5;
            border-radius: 4px;
          }
          
          .detail-content {
            display: flex;
            flex-direction: column;
            gap: 24px;
          }
          
          .detail-main {
            display: flex;
            gap: 24px;
          }
          
          .detail-image-container {
            flex-shrink: 0;
          }
          
          .detail-image {
            width: 200px;
            height: 200px;
            object-fit: cover;
            border-radius: 8px;
            border: 1px solid #e5e5e5;
          }
          
          .detail-info {
            flex: 1;
          }
          
          .detail-info h3 {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 16px;
            line-height: 1.4;
          }
          
          .detail-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
            margin-bottom: 20px;
          }
          
          .detail-item {
            display: flex;
            flex-direction: column;
            gap: 2px;
          }
          
          .detail-item label {
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #666;
            font-weight: 500;
          }
          
          .detail-item span {
            font-size: 13px;
            font-weight: 500;
          }
          
          .detail-notes {
            background: #f8f8f8;
            padding: 16px;
            border-radius: 8px;
            border-left: 3px solid #1a1a1a;
          }
          
          .detail-notes label {
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #666;
            font-weight: 600;
            display: block;
            margin-bottom: 8px;
          }
          
          .detail-notes p {
            font-size: 12px;
            line-height: 1.6;
            color: #333;
          }
          
          .detail-qr {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            padding: 20px;
            background: #f8f8f8;
            border-radius: 8px;
            align-self: flex-start;
          }
          
          .qr-wrapper {
            background: #ffffff;
            padding: 12px;
            border-radius: 8px;
            border: 1px solid #e5e5e5;
          }
          
          .qr-label {
            font-size: 10px;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          @media print {
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            
            .page {
              margin: 0;
              page-break-after: always;
            }
            
            .page:last-child {
              page-break-after: auto;
            }
          }
        </style>
      </head>
      <body>
        ${pagesHTML}
      </body>
    </html>
  `;
}

export function calculatePagination(totalItems: number, itemsPerPage: number = ITEMS_PER_PAGE): { totalPages: number; itemsPerPage: number } {
  return {
    totalPages: Math.ceil(totalItems / itemsPerPage),
    itemsPerPage,
  };
}
