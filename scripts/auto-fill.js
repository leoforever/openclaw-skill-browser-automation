#!/usr/bin/env node
/**
 * 自动表单填写脚本
 * 用法：node auto-fill.js <url> [fields-json]
 * 
 * fields-json 格式：{"字段名":"值", ...}
 * 不提供 fields-json 时自动填充测试数据
 */

import { execSync } from 'child_process';

const BROWSER_CMD = '~/openclaw-deploy/node_modules/.bin/openclaw browser';

function run(cmd, timeout = 30000) {
  try {
    return execSync(cmd, { 
      encoding: 'utf8', 
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout 
    });
  } catch (error) {
    return (error.stdout || '') + (error.stderr || '');
  }
}

function extractFields(output) {
  const fields = [];
  const lines = output.split('\n');
  
  for (const line of lines) {
    // 匹配格式：- textbox "Customer name:" [ref=e1]
    const match = line.match(/^\s*-\s*(textbox|radio|checkbox|select)\s+"([^"]+)"\s+\[ref=(e?\d+)\]/);
    if (match) {
      const [, type, label, ref] = match;
      fields.push({ type, label, ref });
    }
  }
  return fields;
}

function getTestValue(label) {
  const lower = label.toLowerCase();
  if (lower.includes('姓名') || lower.includes('name') || lower.includes('customer')) return '张三';
  if (lower.includes('邮箱') || lower.includes('email') || lower.includes('e-mail')) return 'test@example.com';
  if (lower.includes('电话') || lower.includes('phone') || lower.includes('tel')) return '13800138000';
  if (lower.includes('时间') || lower.includes('time') || lower.includes('delivery')) return '18:00';
  if (lower.includes('地址') || lower.includes('address')) return '测试地址 123 号';
  if (lower.includes('公司') || lower.includes('company')) return '测试公司';
  if (lower.includes('年龄') || lower.includes('age')) return '25';
  if (lower.includes('instruction') || lower.includes('说明')) return '请放在门口';
  return '测试数据';
}

function matchField(label, userFields) {
  const lowerLabel = label.toLowerCase();
  for (const [key, value] of Object.entries(userFields)) {
    const lowerKey = key.toLowerCase();
    if (lowerLabel.includes(lowerKey) || lowerKey.includes(lowerLabel)) {
      return value;
    }
  }
  return null;
}

// 主程序
const url = process.argv[2];
const fieldsInput = process.argv[3] ? JSON.parse(process.argv[3]) : null;

if (!url) {
  console.error('用法：node auto-fill.js <url> [fields-json]');
  console.error('示例：node auto-fill.js https://example.com/form \'{"姓名":"张三","邮箱":"test@example.com"}\'');
  process.exit(1);
}

// 检查当前标签页，如果已经打开目标 URL 则复用
console.log('📑 检查当前标签页...');
const tabsResult = run(`${BROWSER_CMD} tabs`, 30000);

// 解析 tabs 输出，获取第一个标签页的 URL
// 格式：1. 标题\n   https://...\n   id:xxx
const tabLines = tabsResult.split('\n');
let currentUrl = null;
for (let i = 0; i < tabLines.length; i++) {
  if (tabLines[i].trim().match(/^\d+\./)) {
    // 找到下一个标签页，取前一个标签页的 URL
    const urlLine = tabLines[i + 1]?.trim() || '';
    if (urlLine.startsWith('http')) {
      currentUrl = urlLine;
      break;
    }
  }
}

const targetDomain = url.toLowerCase().replace('https://', '').replace('http://', '').split('/')[0];
const currentDomain = currentUrl ? currentUrl.replace('https://', '').replace('http://', '').split('/')[0] : null;
const isAlreadyOnPage = currentDomain === targetDomain;

if (isAlreadyOnPage) {
  console.log(`✅ 已打开目标域名 ${targetDomain}，复用当前页面`);
} else {
  console.log(`🌐 打开页面：${url}`);
  const openResult = run(`${BROWSER_CMD} open "${url}" --timeout 60`, 120000);
  console.log(openResult.split('\n').filter(l => l.includes('opened')).join('\n'));
}

console.log('📸 获取表单元素...');
const snapshotOutput = run(`${BROWSER_CMD} snapshot --interactive`, 60000);
const fields = extractFields(snapshotOutput);

if (fields.length === 0) {
  console.log('⚠️  没有找到表单字段，尝试使用 AI 快照模式...');
  const aiSnapshot = run(`${BROWSER_CMD} snapshot`, 60000);
  const aiFields = extractFields(aiSnapshot);
  if (aiFields.length > 0) {
    fields.push(...aiFields);
  }
}

if (fields.length === 0) {
  console.log('❌ 无法解析表单字段，请手动检查页面');
  console.log('原始输出:', snapshotOutput.substring(0, 500));
  process.exit(1);
}

console.log(`📋 发现 ${fields.length} 个表单字段:`);
fields.forEach(f => console.log(`   - ${f.label} (${f.type}) [${f.ref}]`));

// 构建填写数据
const fillData = [];
const textFields = fields.filter(f => f.type === 'textbox');

if (textFields.length === 0) {
  console.log('⚠️  没有找到文本输入框');
  process.exit(0);
}

console.log('\n✏️  准备填写以下字段:');
for (const field of textFields) {
  let value;
  
  if (fieldsInput) {
    value = matchField(field.label, fieldsInput);
  }
  
  if (!value) {
    value = getTestValue(field.label);
  }
  
  fillData.push({ ref: field.ref, value });
  console.log(`   - ${field.ref} (${field.label}): ${value}`);
}

console.log(`\n✏️  填写 ${fillData.length} 个字段...`);
const fillResult = run(`${BROWSER_CMD} fill --fields '${JSON.stringify(fillData)}'`, 60000);
console.log(fillResult.split('\n').filter(l => l.includes('filled')).join('\n'));

// 自动选择常见的单选/复选框
for (const field of fields) {
  if (field.type === 'radio' && field.label.toLowerCase().includes('medium')) {
    console.log(`☑️  选择：${field.label}`);
    run(`${BROWSER_CMD} click ${field.ref}`, 30000);
  } else if (field.type === 'checkbox' && field.label.toLowerCase().includes('bacon')) {
    console.log(`☑️  选择：${field.label}`);
    run(`${BROWSER_CMD} click ${field.ref}`, 30000);
  }
}

console.log('\n✅ 表单填写完成！');
console.log('\n📸 最终快照:');
const finalSnapshot = run(`${BROWSER_CMD} snapshot --interactive`, 60000);
const finalFields = extractFields(finalSnapshot);
finalFields.forEach(f => {
  const status = f.type === 'radio' || f.type === 'checkbox' ? (finalSnapshot.includes(`${f.ref}] [checked]`) ? '☑️' : '⬜') : '📝';
  console.log(`   ${status} ${f.label} [${f.ref}]`);
});
