/**
 * Simple approach: Create a modified version of renderTable that uses gallery colors
 * This file patches the preview generator to apply gallery template colors
 */

import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const previewGenPath = join(__dirname, 'preview-generator.tsx')
let content = readFileSync(previewGenPath, 'utf-8')

// Find and replace the hardcoded colors in renderTable function
content = content.replace(
    /background: linear-gradient\(to bottom, #1e293b, #0f172a\);/g,
    'background: linear-gradient(to bottom, ${primaryColor}, ${secondaryColor});'
)

content = content.replace(
    /border: 1px solid #1e293b;/g,
    'border: 1px solid ${primaryColor};'
)

content = content.replace(
    /border-bottom: 2px solid #3b82f6;/g,
    'border-bottom: 2px solid ${accentColor};'
)

writeFileSync(previewGenPath, content, 'utf-8')
console.log('Preview generator patched successfully!')
