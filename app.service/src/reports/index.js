import { AppContext } from '../database/index.js'

import ejs from 'ejs'
import puppeteer from 'puppeteer'

import path from 'path'
import { fileURLToPath } from 'url'

export class Report {

  static generate = async ({report, title, data}) => {
    
    const options = {
      title,
      logoUrl: 'path/to/logo.png',
      data,
      totalVendas: 500,
      totalItens: 7
    }

    const __dirname = path.dirname(fileURLToPath(import.meta.url))

    return new Promise(async (resolve, reject) => {
      try {

        ejs.renderFile(`${__dirname}/layouts/${report}`, options, async (error, html) => {

          if (error) {
            reject(new Error(error.message))
          }

          const browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox']
          })

          const page = await browser.newPage()
          await page.setContent(html)

          const pdfBase64 = await page.pdf({
            format: "A4",
            displayHeaderFooter: true,
            headerTemplate: `
              <div style="font-size: 12px; text-align: center; width: 100%;">
                Relatório de Produtos - <span class="date"></span>
              </div>`,
            footerTemplate: `
              <div style="font-size: 12px; text-align: center; width: 100%;">
                Página <span class="pageNumber"></span> de <span class="totalPages"></span>
              </div>`,
            margin: {
              top: "60px",
              bottom: "40px",
            },
            encoding: 'base64'
          })

          await browser.close()

          resolve(Buffer.from(pdfBase64).toString('base64'))

        })

      } catch (error) {
        reject(new Error(error.message))
      }

    })

  }

}