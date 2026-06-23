interface PrintColumn {
  header: string;
  key: string;
}

interface PrintStatementOptions {
  title: string;
  subtitle?: string;
  summaryRows?: { label: string; value: string }[];
  columns: PrintColumn[];
  rows: any[];
}

export function printStatement({ title, subtitle, summaryRows, columns, rows }: PrintStatementOptions) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Print window block ho gayi. Popup blocker check karein.");
    return;
  }

  const summaryHTML = summaryRows
    ? `<div class="summary">
        ${summaryRows.map((s) => `<div class="summary-item"><span class="label">${s.label}:</span> <span class="value">${s.value}</span></div>`).join("")}
      </div>`
    : "";

  const tableHeadHTML = `<tr>${columns.map((c) => `<th>${c.header}</th>`).join("")}</tr>`;

  const tableBodyHTML = rows
    .map(
      (row) =>
        `<tr>${columns.map((c) => `<td>${row[c.key] ?? "-"}</td>`).join("")}</tr>`
    )
    .join("");

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; color: #000; padding: 24px; }
          h1 { font-size: 20px; margin-bottom: 4px; }
          .subtitle { font-size: 12px; color: #555; margin-bottom: 16px; }
          .summary { display: flex; flex-wrap: wrap; gap: 16px; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid #ccc; }
          .summary-item { font-size: 12px; }
          .summary-item .label { color: #555; }
          .summary-item .value { font-weight: bold; }
          table { width: 100%; border-collapse: collapse; font-size: 11px; }
          th, td { border: 1px solid #ccc; padding: 6px 8px; text-align: left; }
          th { background: #f0f0f0; font-weight: bold; text-transform: uppercase; font-size: 10px; }
          tr:nth-child(even) { background: #fafafa; }
          .footer { margin-top: 20px; text-align: center; font-size: 10px; color: #777; }
          @media print {
            body { padding: 10px; }
          }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        ${subtitle ? `<p class="subtitle">${subtitle}</p>` : ""}
        ${summaryHTML}
        <table>
          <thead>${tableHeadHTML}</thead>
          <tbody>${tableBodyHTML}</tbody>
        </table>
        <p class="footer">Generated on ${new Date().toLocaleString("en-PK", { timeZone: "Asia/Karachi" })}</p>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 300);
}