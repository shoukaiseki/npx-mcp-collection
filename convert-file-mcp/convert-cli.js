#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { excelToHtml, excelToMarkdown, excelToJson, excelToCsv } = require('./src/tools/excel');

const args = process.argv.slice(2);

if (args.length < 2) {
  console.log('用法: node convert-cli.js <输入文件> <输出格式>');
  console.log('支持的输出格式: html, markdown, json, csv');
  process.exit(1);
}

const inputFile = args[0];
const outputFormat = args[1].toLowerCase();

if (!fs.existsSync(inputFile)) {
  console.error(`错误: 文件不存在 ${inputFile}`);
  process.exit(1);
}

const outputDir = path.dirname(inputFile);
const inputName = path.basename(inputFile, path.extname(inputFile));

const converters = {
  html: excelToHtml,
  markdown: excelToMarkdown,
  json: excelToJson,
  csv: excelToCsv
};

const extMap = {
  markdown: 'md'
};

try {
  const buffer = fs.readFileSync(inputFile);
  const converter = converters[outputFormat];

  if (!converter) {
    console.error(`错误: 不支持的输出格式 ${outputFormat}`);
    console.log('支持的输出格式: html, markdown, json, csv');
    process.exit(1);
  }

  const result = converter(buffer);
  const ext = extMap[outputFormat] || outputFormat;
  const outputFile = path.join(outputDir, `${inputName}.${ext}`);

  fs.writeFileSync(outputFile, result, 'utf-8');
  console.log(`转换成功! 输出文件: ${outputFile}`);
} catch (err) {
  console.error(`转换失败: ${err.message}`);
  process.exit(1);
}
