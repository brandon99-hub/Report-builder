/**
 * Screenshot Generator for Invoice Templates
 * Uses Puppeteer to automatically generate screenshots from HTML templates
 */

import puppeteer from 'puppeteer'
import { mkdir } from 'fs/promises'
import path from 'path'

const TEMPLATES_TO_SCREENSHOT = [
  {
    id: 'professional-blue-001',
    url: 'https://nirajrajgor.github.io/html-invoice-templates/invoice1/invoice1.html',
    outputName: 'professional-blue-001.png',
  },
  {
    id: 'modern-proposal-002',
    url: 'https://nirajrajgor.github.io/html-invoice-templates/invoice2/invoice2.html',
    outputName: 'modern-proposal-002.png',
  },
  {
    id: 'minimal-elegant-003',
    url: 'https://nirajrajgor.github.io/html-invoice-templates/invoice3/invoice3.html',
    outputName: 'minimal-elegant-003.png',
  },
  // Placeholder screenshots for custom templates (will use generic preview)
  {
    id: 'healthcare-medical-004',
    url: 'https://nirajrajgor.github.io/html-invoice-templates/invoice1/invoice1.html', // Use template 1 as base
    outputName: 'healthcare-medical-004.png',
  },
  {
    id: 'construction-contractor-005',
    url: 'https://nirajrajgor.github.io/html-invoice-templates/invoice2/invoice2.html', // Use template 2 as base
    outputName: 'construction-contractor-005.png',
  },
  {
    id: 'retail-colorful-006',
    url: 'https://nirajrajgor.github.io/html-invoice-templates/invoice3/invoice3.html', // Use template 3 as base
    outputName: 'retail-colorful-006.png',
  },
]

async function generateScreenshots() {
  console.log('🚀 Starting screenshot generation...')

  // Create screenshots directory if it doesn't exist
  const screenshotsDir = path.join(process.cwd(), 'public', 'templates', 'screenshots')
  await mkdir(screenshotsDir, { recursive: true })

  // Launch browser
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  try {
    for (const template of TEMPLATES_TO_SCREENSHOT) {
      console.log(`📸 Generating screenshot for: ${template.id}`)

      const page = await browser.newPage()

      // Set viewport size for consistent screenshots
      await page.setViewport({
        width: 1200,
        height: 1600,
        deviceScaleFactor: 2, // High DPI for crisp images
      })

      // Navigate to template URL
      await page.goto(template.url, {
        waitUntil: 'networkidle0',
        timeout: 30000,
      })

      // Wait a bit for any animations/fonts to load
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Take screenshot
      const outputPath = path.join(screenshotsDir, template.outputName)
      await page.screenshot({
        path: outputPath,
        type: 'png',
        fullPage: false, // Just the viewport
      })

      console.log(`✅ Saved: ${outputPath}`)

      await page.close()
    }

    console.log('🎉 All screenshots generated successfully!')
  } catch (error) {
    console.error('❌ Error generating screenshots:', error)
    throw error
  } finally {
    await browser.close()
  }
}

// Run the script
generateScreenshots().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
