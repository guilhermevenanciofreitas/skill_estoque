import { AppContext } from "../../database/index.js"
import { Authorization } from "../authorization.js"
import { formidable } from 'formidable'
import fs from 'fs'
import path from 'path'
import _ from 'lodash'
import { fileURLToPath } from 'url'
import xml2js from 'xml2js'
import dayjs from "dayjs"
import Sequelize from "sequelize"
//import axios from 'axios'

import ejs from 'ejs'
import pdf from 'html-pdf'

import fetch from 'node-fetch';
import { Buffer } from 'buffer';
import { Exception } from "../../utils/exception.js"

export class RelatorioProdutoController {

  lista = async (req, res) => {
    //await Authorization.verify(req, res).then(async ({company}) => {
      try {

        const db = new AppContext()

        const where = []

        /*
        if (search?.input) {

          if (search?.picker == 'descricao') {
            where.push({'descricao': {[Sequelize.Op.like]: `%${search.input.replace(' ', "%")}%`}})
          }
  
        }
        */
        
        /*
        const produtos = await db.Produto.findAndCountAll({
          attributes: ['codprod', 'descricao', 'unidade'],
          order: [['descricao', 'asc']],
          where,
        })
        */

        const produtos = await db.Produto.findAndCountAll({
          attributes: [
            'codprod',
            'descricao', 
            'unidade',
            'custo',
            'customed',
            'ultcomp',
            [Sequelize.fn('SUM', Sequelize.col('estoque.saldo')), 'saldo']
          ],
          include: [
            {model: db.Estoque, as: 'estoque', attributes: []}
          ],
          group: ['produto.codprod', 'produto.id', 'produto.descricao', 'produto.unidade', 'produto.custo', 'produto.customed', 'produto.ultcomp'],
          order: [['descricao', 'asc']],
          where,
        })

        const estoqueLocais = await db.Estoque.findAll({
          attributes: [
            'codprod',
            'codloc',
            [Sequelize.fn('SUM', Sequelize.col('saldo')), 'saldo']
          ],
          include: [
            {model: db.Produto, as: 'produto', attributes: []},
            {model: db.Local, as: 'local', attributes: []}
          ],
          group: ['estoque.id', 'produto.id', 'estoque.codprod', 'estoque.codloc', 'produto.custo'],
          //order: [['descricao', 'asc']],
          //where,
        })

        const locais = await db.Local.findAll({attributes: ['id', 'descricao']})
        

        res.status(200).json({
          response: {
            rows: produtos.rows, estoqueLocais, locais
          }
        })

      } catch (error) {
        Exception.error(res, error)
      }
    //}).catch((error) => {
    //  res.status(400).json({message: error.message})
    //})
  }

  pdf = async (req, res) => {
    //await Authorization.verify(req, res).then(async ({company}) => {
      try {

        const db = new AppContext()

        const produtos = await db.Produto.findAll({attributes: ['codprod', 'descricao', 'unidade', 'custo', 'customed', 'ultcomp'], order: [['descricao', 'asc']]})

        const items = []

        for (const item of produtos) {
          items.push({codigo: item.codprod, produto: item.descricao, unidade: item.unidade, custo: item.custo, custoMedio: item.customed, ultimaCompra: item.ultcomp})
        }

        const data = {
          title: 'Relatório de produtos',
          logoUrl: 'path/to/logo.png',  // Caminho para o logo da empresa
          items,
          totalVendas: 500,
          totalItens: 7
        }

        const __dirname = path.dirname(fileURLToPath(import.meta.url))

        console.log(__dirname)
        
        ejs.renderFile(`${__dirname}/produtos.ejs`, data, async (err, html) => {

          if (err) {
            console.error('Erro ao gerar HTML:', err)
            return
          }
          
          const options = { format: 'A4' }

          pdf.create(html, options).toBuffer((error, pdf) => {
            if (error) {
              res.json({error});
            } else {
              res.status(200).json({pdf: Buffer.from(pdf).toString('base64')})
            }
          })

        })

      } catch (error) {
        Exception.error(res, error)
      }
    //}).catch((error) => {
    //  res.status(400).json({message: error.message})
    //})
  }

  gerarPDF = async (html) => {

    const options = { format: 'A4' }
  
    return new Promise((resolve, reject) => {
      pdf.create(html, options).toBuffer((err, res) => {
        if (err) {
          reject('Erro ao gerar PDF: ' + err)
        } else {
          resolve(res)
        }
      })
    })

  }

}