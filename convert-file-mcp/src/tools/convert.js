const { parse } = require('csv-parse');
const { stringify } = require('csv-stringify');
const { parse: yamlParse, stringify: yamlStringify } = require('yaml');
const { marked } = require('marked');
const { parseString, Builder } = require('xml2js');
const XLSX = require('xlsx');

async function csv_to_json({ csv_content }) {
  return new Promise((resolve, reject) => {
    parse(csv_content, { columns: true, skip_empty_lines: true }, (err, records) => {
      if (err) {
        reject({ error: { message: err.message } });
      } else {
        resolve({ content: JSON.stringify(records, null, 2) });
      }
    });
  });
}

async function json_to_csv({ json_content }) {
  return new Promise((resolve, reject) => {
    try {
      const data = JSON.parse(json_content);
      stringify(data, { header: true }, (err, output) => {
        if (err) {
          reject({ error: { message: err.message } });
        } else {
          resolve({ content: output });
        }
      });
    } catch (err) {
      reject({ error: { message: '无效的JSON格式' } });
    }
  });
}

async function json_to_yaml({ json_content }) {
  try {
    const data = JSON.parse(json_content);
    return { content: yamlStringify(data, { indent: 2 }) };
  } catch (err) {
    return { error: { message: '无效的JSON格式' } };
  }
}

async function yaml_to_json({ yaml_content }) {
  try {
    const data = yamlParse(yaml_content);
    return { content: JSON.stringify(data, null, 2) };
  } catch (err) {
    return { error: { message: '无效的YAML格式' } };
  }
}

async function markdown_to_html({ markdown_content }) {
  try {
    const html = marked(markdown_content);
    return { content: html };
  } catch (err) {
    return { error: { message: 'Markdown转换失败' } };
  }
}

async function xml_to_json({ xml_content }) {
  return new Promise((resolve, reject) => {
    parseString(xml_content, { explicitArray: false }, (err, result) => {
      if (err) {
        reject({ error: { message: err.message } });
      } else {
        resolve({ content: JSON.stringify(result, null, 2) });
      }
    });
  });
}

async function json_to_xml({ json_content }) {
  try {
    const data = JSON.parse(json_content);
    const builder = new Builder({ headless: true, renderOpts: { pretty: true } });
    const xml = builder.buildObject(data);
    return { content: xml };
  } catch (err) {
    return { error: { message: '无效的JSON格式' } };
  }
}

async function excel_to_html({ excel_base64 }) {
  try {
    const buffer = Buffer.from(excel_base64, 'base64');
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    let html = '';
    
    workbook.SheetNames.forEach(sheetName => {
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      html += `<h2>${sheetName}</h2>`;
      html += '<table border="1" cellpadding="8" cellspacing="0">';
      
      data.forEach((row, rowIndex) => {
        html += '<tr>';
        row.forEach((cell, colIndex) => {
          const tag = rowIndex === 0 ? 'th' : 'td';
          html += `<${tag}>${cell !== undefined ? escapeHtml(cell.toString()) : ''}</${tag}>`;
        });
        html += '</tr>';
      });
      
      html += '</table><br>';
    });
    
    return { content: html };
  } catch (err) {
    return { error: { message: 'Excel解析失败: ' + err.message } };
  }
}

async function excel_to_markdown({ excel_base64 }) {
  try {
    const buffer = Buffer.from(excel_base64, 'base64');
    const workbook = XLSX.read(buffer, { type: 'buffer' });
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
    
    return { content: markdown.trim() };
  } catch (err) {
    return { error: { message: 'Excel解析失败: ' + err.message } };
  }
}

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

module.exports = {
  csv_to_json,
  json_to_csv,
  json_to_yaml,
  yaml_to_json,
  markdown_to_html,
  xml_to_json,
  json_to_xml,
  excel_to_html,
  excel_to_markdown
};