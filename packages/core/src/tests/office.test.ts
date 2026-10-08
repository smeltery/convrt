import { afterAll, expect, test } from 'bun:test'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { officeExecutable } from '../engines/availability.ts'
import { convert } from '../index.ts'

const dir = await mkdtemp(join(tmpdir(), 'convrt-office-test-'))
afterAll(() => rm(dir, { recursive: true, force: true }))
test.skipIf(!officeExecutable())(
  'Office documents, spreadsheets and slides',
  async () => {
    const text = join(dir, 'document.txt')
    await Bun.write(text, 'Local document conversion\n')
    const csv = join(dir, 'sheet.csv')
    await Bun.write(csv, 'Name,Value\nExample,42\n')
    for (const to of ['doc', 'docx', 'odt', 'rtf', 'html', 'pdf']) {
      const output = join(dir, `document.${to}`)
      expect(
        (await convert({ input: text, to, output })).bytesOut,
      ).toBeGreaterThan(0)
      if (to !== 'pdf')
        expect(
          (
            await convert({
              input: output,
              to: 'txt',
              output: join(dir, `from-${to}.txt`),
            })
          ).bytesOut,
        ).toBeGreaterThan(0)
    }
    for (const to of ['xls', 'xlsx', 'ods']) {
      const output = join(dir, `sheet.${to}`)
      await convert({ input: csv, to, output })
      expect(
        (
          await convert({
            input: output,
            to: 'pdf',
            output: join(dir, `sheet-${to}.pdf`),
          })
        ).bytesOut,
      ).toBeGreaterThan(0)
    }
    // Flat OpenDocument fixture is opened by LibreOffice and saved as ODP first.
    const flat = join(dir, 'slides.fodp')
    await Bun.write(
      flat,
      '<?xml version="1.0"?><office:document xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:draw="urn:oasis:names:tc:opendocument:xmlns:drawing:1.0" office:version="1.2" office:mimetype="application/vnd.oasis.opendocument.presentation"><office:body><office:presentation><draw:page draw:name="Slide 1"/></office:presentation></office:body></office:document>',
    )
    const executable = officeExecutable()
    if (!executable) throw new Error('LibreOffice disappeared')
    const child = Bun.spawn(
      [executable, '--headless', '--convert-to', 'odp', '--outdir', dir, flat],
      { stdout: 'ignore', stderr: 'ignore' },
    )
    expect(await child.exited).toBe(0)
    for (const to of ['ppt', 'pptx', 'pdf'])
      expect(
        (
          await convert({
            input: join(dir, 'slides.odp'),
            to,
            output: join(dir, `slides.${to}`),
          })
        ).bytesOut,
      ).toBeGreaterThan(0)
  },
  120000,
)
