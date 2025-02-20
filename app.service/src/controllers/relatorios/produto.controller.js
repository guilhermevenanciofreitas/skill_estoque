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
import puppeteer from 'puppeteer';

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
            [Sequelize.fn('SUM', Sequelize.col('estoque.saldo')), 'saldo']
          ],
          include: [
            {model: db.Estoque, as: 'estoque', attributes: []}
          ],
          group: ['produto.codprod', 'produto.id', 'produto.descricao', 'produto.unidade', 'produto.custo'],
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
        res.status(500).json({message: error.message})
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
        
        ejs.renderFile('src\\controllers\\relatorios\\produtos.ejs', data, async (err, html) => {

          if (err) {
            console.error('Erro ao gerar HTML:', err)
            return
          }
          
          const browser = await puppeteer.launch()
          const page = await browser.newPage()
          
          await page.setContent(html)
          
          const pdfBase64 = await page.pdf({format: 'A4', printBackground: true, margin: {top: '10mm', right: '10mm', bottom: '10mm', left: '10mm'}, encoding: 'base64'})
          
          res.status(200).json({pdf: Buffer.from(pdfBase64).toString('base64')})
          
          await browser.close()

        })

      } catch (error) {
        Exception.error(res, error)
      }
    //}).catch((error) => {
    //  res.status(400).json({message: error.message})
    //})
  }

}