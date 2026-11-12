/**
 * Extracts plain text content from a PDF Buffer using pdf-parse.
 * Imports pdf-parse/lib/pdf-parse directly to bypass index.js debug auto-run in bundled environments.
 */
export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require('pdf-parse/lib/pdf-parse.js')
  const data = await pdfParse(buffer)
  return (data.text || '').trim()
}
