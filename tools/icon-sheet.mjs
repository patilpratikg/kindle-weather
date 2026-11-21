import { writeFileSync } from 'node:fs';
import puppeteer from 'puppeteer';
import { icon } from '../src/icons.js';
const names = ['sun','moon','cloud','partlyDay','partlyNight','fog','drizzle','rain','heavyrain','thunder','snow'];
const html = `<body style="margin:0;background:#fff;font:12px sans-serif;display:flex;flex-wrap:wrap;gap:16px;padding:16px;width:600px">${names.map(n=>`<div style="text-align:center">${icon(n,64,1.4)}<br>${n}</div>`).join('')}</body>`;
const b = await puppeteer.launch(); const p = await b.newPage(); await p.setViewport({width:600,height:220});
await p.setContent(html); await p.screenshot({path: process.argv[2]}); await b.close();
