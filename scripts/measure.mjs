#!/usr/bin/env node
// Runs Lighthouse (desktop + mobile) and axe against a running server,
// writing raw JSON to an output directory. Start the server first:
//   npm run build && npm start
import { execFileSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const args = process.argv.slice(2)
const outFlag = args.indexOf('--out')
const OUT = outFlag !== -1 ? args[outFlag + 1] : 'docs/baseline'
const BASE = process.env.MEASURE_BASE_URL ?? 'http://localhost:3000'

const ROUTES = [
    ['home', '/'],
    ['properties', '/properties'],
    ['contact', '/contact'],
]

const WIDTHS = [375, 390, 768, 1024, 1440, 1920]

mkdirSync(OUT, { recursive: true })

function run(cmd, cmdArgs) {
    try {
        return execFileSync(cmd, cmdArgs, {
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'pipe'],
            shell: process.platform === 'win32',
        })
    } catch (err) {
        // Lighthouse and axe exit non-zero when they find problems.
        // That is the expected case for a baseline run — keep the output.
        return err.stdout ?? ''
    }
}

for (const [name, path] of ROUTES) {
    const url = `${BASE}${path}`

    const lh = run('npx', [
        'lighthouse', url,
        '--quiet',
        '--output=json',
        '--chrome-flags=--headless=new --no-sandbox',
        '--only-categories=performance,accessibility,best-practices,seo',
    ])
    writeFileSync(join(OUT, `lighthouse-${name}.json`), lh)

    const axe = run('npx', [
        'axe', url,
        '--stdout',
        '--chrome-options=headless,no-sandbox',
        '--tags=wcag2a,wcag2aa,wcag21a,wcag21aa,wcag22aa',
    ])
    writeFileSync(join(OUT, `axe-${name}.json`), axe)

    console.log(`measured ${name}`)
}

writeFileSync(
    join(OUT, 'meta.json'),
    JSON.stringify({ base: BASE, routes: ROUTES, widths: WIDTHS }, null, 2),
)
console.log(`wrote results to ${OUT}`)
