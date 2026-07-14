const fs = require('fs');
const { excelToHtml, excelToMarkdown, excelToJson, excelToCsv } = require('./excel');

// 读取文本文件
function readText(filePath) {
  return fs.readFileSync(filePath, 'utf-8');
}

// 读取二进制文件
function readBuffer(filePath) {
  return fs.readFileSync(filePath);
}

// CSV → JSON
async function csv_to_json_file({ file_path }) {
  try {
    const content = readText(file_path);
    const { parse } = require('csv-parse');
    return new Promise((resolve, reject) => {
      parse(content, { columns: true, skip_empty_lines: true }, (err, records) => {
        if (err) reject({ error: { message: err.message } });
        else resolve({ content: JSON.stringify(records, null, 2) });
      });
    });
  } catch (err) {
    return { error: { message: '读取文件失败: ' + err.message } };
  }
}

// JSON → CSV
async function json_to_csv_file({ file_path }) {
  try {
    const content = readText(file_path);
    const { stringify } = require('csv-stringify');
    return new Promise((resolve, reject) => {
      try {
        const data = JSON.parse(content);
        stringify(data, { header: true }, (err, output) => {
          if (err) reject({ error: { message: err.message } });
          else resolve({ content: output });
        });
      } catch (err) {
        reject({ error: { message: '无效的JSON格式' } });
      }
    });
  } catch (err) {
    return { error: { message: '读取文件失败: ' + err.message } };
  }
}

// JSON → YAML
async function json_to_yaml_file({ file_path }) {
  try {
    const content = readText(file_path);
    const { stringify: yamlStringify } = require('yaml');
    const data = JSON.parse(content);
    return { content: yamlStringify(data, { indent: 2 }) };
  } catch (err) {
    return { error: { message: err.message } };
  }
}

// YAML → JSON
async function yaml_to_json_file({ file_path }) {
  try {
    const content = readText(file_path);
    const { parse: yamlParse } = require('yaml');
    const data = yamlParse(content);
    return { content: JSON.stringify(data, null, 2) };
  } catch (err) {
    return { error: { message: err.message } };
  }
}

// Markdown → HTML
async function markdown_to_html_file({ file_path }) {
  try {
    const content = readText(file_path);
    const { marked } = require('marked');
    return { content: marked(content) };
  } catch (err) {
    return { error: { message: err.message } };
  }
}

// XML → JSON
async function xml_to_json_file({ file_path }) {
  try {
    const content = readText(file_path);
    const { parseString } = require('xml2js');
    return new Promise((resolve, reject) => {
      parseString(content, { explicitArray: false }, (err, result) => {
        if (err) reject({ error: { message: err.message } });
        else resolve({ content: JSON.stringify(result, null, 2) });
      });
    });
  } catch (err) {
    return { error: { message: err.message } };
  }
}

// JSON → XML
async function json_to_xml_file({ file_path }) {
  try {
    const content = readText(file_path);
    const { Builder } = require('xml2js');
    const data = JSON.parse(content);
    const builder = new Builder({ headless: true, renderOpts: { pretty: true } });
    return { content: builder.buildObject(data) };
  } catch (err) {
    return { error: { message: err.message } };
  }
}

// Excel → HTML
async function excel_to_html_file({ file_path }) {
  try {
    const buffer = readBuffer(file_path);
    return { content: excelToHtml(buffer) };
  } catch (err) {
    return { error: { message: '读取文件失败: ' + err.message } };
  }
}

// Excel → Markdown
async function excel_to_markdown_file({ file_path }) {
  try {
    const buffer = readBuffer(file_path);
    return { content: excelToMarkdown(buffer) };
  } catch (err) {
    return { error: { message: '读取文件失败: ' + err.message } };
  }
}

// Excel → JSON
async function excel_to_json_file({ file_path }) {
  try {
    const buffer = readBuffer(file_path);
    return { content: excelToJson(buffer) };
  } catch (err) {
    return { error: { message: '读取文件失败: ' + err.message } };
  }
}

// Excel → CSV
async function excel_to_csv_file({ file_path }) {
  try {
    const buffer = readBuffer(file_path);
    return { content: excelToCsv(buffer) };
  } catch (err) {
    return { error: { message: '读取文件失败: ' + err.message } };
  }
}

module.exports = {
  csv_to_json_file,
  json_to_csv_file,
  json_to_yaml_file,
  yaml_to_json_file,
  markdown_to_html_file,
  xml_to_json_file,
  json_to_xml_file,
  excel_to_html_file,
  excel_to_markdown_file,
  excel_to_json_file,
  excel_to_csv_file
};