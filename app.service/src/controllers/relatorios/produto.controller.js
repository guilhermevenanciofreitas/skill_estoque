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

import fetch from 'node-fetch';
import { Buffer } from 'buffer';

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

}