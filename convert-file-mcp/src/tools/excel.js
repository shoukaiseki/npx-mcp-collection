const XLSX = require('xlsx');

/**
 * Excel 转换核心模块
 * 所有转换逻辑的单一来源，供 MCP 工具和 CLI 共同引用
 */

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

function readWorkbook(buffer) {
  return XLSX.read(buffer, { type: 'buffer' });
}

function excelToHtml(buffer) {
  const workbook = readWorkbook(buffer);
  let html = '';

  workbook.SheetNames.forEach(sheetName => {
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    html += `<h2>${sheetName}</h2>`;
    html += '<table border="1" cellpadding="8" cellspacing="0">';

    data.forEach((row, rowIndex) => {
      html += '<tr>';
      row.forEach((cell) => {
        const tag = rowIndex === 0 ? 'th' : 'td';
        html += `<${tag}>${cell !== undefined ? escapeHtml(cell.toString()) : ''}</${tag}>`;
      });
      html += '</tr>';
    });

    html += '</table><br>';
  });

  return html;
}

function excelToMarkdown(buffer) {
  const workbook = readWorkbook(buffer);
  let markdown = '';

  workbook.SheetNames.forEach(sheetName => {
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    markdown += `## ${sheetName}\n\n`;

    if (data.length > 0) {
      data.forEach((row, rowIndex) => {
        markdown += '| ' + row.map(cell => cell !== undefined ? cell.toString() : '').join(' | ') + ' |';
        markdown += '\n';

        if (rowIndex === 0 && data.length > 1) {
          markdown += '| ' + row.map(() => '---').join(' | ') + ' |';
          markdown += '\n';
        }
      });
    }

    markdown += '\n';
  });

  return markdown.trim();
}

function excelToJson(buffer) {
  const workbook = readWorkbook(buffer);
  const jsonData = {};

  workbook.SheetNames.forEach(sheetName => {
    const worksheet = workbook.Sheets[sheetName];
    jsonData[sheetName] = XLSX.utils.sheet_to_json(worksheet);
  });

  return JSON.stringify(jsonData, null, 2);
}

function excelToCsv(buffer) {
  const workbook = readWorkbook(buffer);
  let result = '';

  workbook.SheetNames.forEach((sheetName, index) => {
    if (index > 0) result += '\n';
    const worksheet = workbook.Sheets[sheetName];
    result += `# ${sheetName}\n`;
    result += XLSX.utils.sheet_to_csv(worksheet);
  });

  return result;
}

module.exports = {
  excelToHtml,
  excelToMarkdown,
  excelToJson,
  excelToCsv
};
