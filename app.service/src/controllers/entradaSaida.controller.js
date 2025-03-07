import { AppContext } from "../database/index.js"
import { Authorization } from "./authorization/authorization.js"
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
import { Exception } from "../utils/exception.js"

import sql from 'mssql'

export class EntradaSaidaController {

  lista = async (req, res) => {
    //await Authorization.verify(req, res).then(async ({company}) => {
      try {

        const db = new AppContext()

        const limit = req.body.limit || 50
        const offset = req.body.offset || 0
        const search = req.body.search

        const where = []

        /*
        if (search?.input) {

          if (search?.picker == 'descricao') {
            where.push({'descricao': {[Sequelize.Op.like]: `%${search.input.replace(' ', "%")}%`}})
          }
  
        }
        */
        
        const movCabs = await db.MovCab.findAndCountAll({
          attributes: ['transacao', 'emissao', 'dtmov', 'numdoc', 'total', 'obs'],
          include: [
            {model: db.Parceiro, as: 'parceiro', attributes: ['nome']},
            {model: db.TipoEntSai, as: 'tipoEntSai', attributes: ['tipo', 'descricao']}
          ],
          limit: limit,
          offset: offset * limit,
          //order: [['descricao', 'asc']],
          where
        })

        res.status(200).json({
          request: {
            limit, offset
          },
          response: {
            rows: movCabs.rows, count: movCabs.count
          }
        })

      } catch (error) {
        Exception.error(res, error)
      }
    //}).catch((error) => {
    //  res.status(400).json({message: error.message})
    //})
  }

  editar = async (req, res) => {
    //await Authorization.verify(req, res).then(async () => {
      try {

        const { transacao } = req.body

        const db = new AppContext()

        await db.transaction(async (transaction) => {
            
          const movCabs = await db.MovCab.findOne({
            attributes: ['transacao', 'inclusao', 'alteracao', 'emissao', 'dtmov', 'numdoc', 'total', 'obs'],
            include: [
              {model: db.Parceiro, as: 'parceiro', attributes: ['codparc', 'nome']},
              {model: db.TipoEntSai, as: 'tipoEntSai', attributes: ['codentsai', 'tipo']},
            ],
            where: [{transacao}],
            transaction
          })

          const movItems = await db.MovItem.findAll({
            attributes: ['id', 'qtde', 'punit'], include: [
              {model: db.Produto, as: 'produto', attributes: ['codprod', 'descricao', 'unidade']},
              {model: db.Local, as: 'orig', attributes: ['codloc', 'descricao']},
              {model: db.Local, as: 'dest', attributes: ['codloc', 'descricao']},
            ],
            where: [{transacao}],
            transaction
          })

          movCabs.dataValues.items = movItems

          res.status(200).json(movCabs)
          
        })

      } catch (error) {
        Exception.error(res, error)
      }
    //}).catch((error) => {
    //  res.status(400).json({message: error.message})
    //})
  }

  salvar = async (req, res) => {
    //await Authorization.verify(req, res).then(async () => {
      try {

        let movCab = {
          transacao: req.body.transacao,
          codparc: req.body.parceiro?.codparc || null,
          codentsai: req.body.tipoEntSai?.codentsai || null,
          emissao: req.body.emissao || null,
          dtmov: req.body.dtmov,
          numdoc: req.body.numdoc,
          total: req.body.total,
          obs: req.body.obs
        }

        const movItems = req.body.items || []

        const db = new AppContext();

        await db.transaction(async (transaction) => {

          if (_.isNil(movCab.transacao)) {
            const lastTransacao = await db.MovCab.max('transacao', { transaction })
            movCab.transacao = lastTransacao ? lastTransacao + 1 : 1
            movCab.inclusao = dayjs().format('YYYY-MM-DD HH:mm')
            movCab = await db.MovCab.create(movCab, {transaction})
          } else {
            movCab.alteracao = dayjs().format('YYYY-MM-DD HH:mm')
            await db.MovCab.update(movCab, {where: [{transacao: movCab.transacao}], transaction})
            await this.processMovimentos(2, movCab.transacao)
          }

          await db.MovItem.destroy({where: [{transacao: movCab.transacao}], transaction})

          for (const item of movItems) {

            const movItem = {
              transacao: movCab.transacao,
              codprod: item.produto?.codprod || null,
              qtde: item.qtde,
              punit: item.punit,
              codloc1: item.orig?.codloc || null,
              codloc2: item.dest?.codloc || null
            }

            await db.MovItem.create(movItem, {transaction})

          }

        })

        await this.processMovimentos(1, movCab.transacao)
       
        res.status(200).json(movCab)

      } catch (error) {
        Exception.error(res, error)
      }
    //}).catch((error) => {
    //  res.status(400).json({message: error.message})
    //})
  }

  tipoOperacoes = async (req, res) => {
    //await Authorization.verify(req, res).then(async ({company}) => {
      try {

        const db = new AppContext()

        const { tipo } = req.body

        const where = [{tipo}]

        /*
        if (search?.input) {

          if (search?.picker == 'descricao') {
            where.push({'descricao': {[Sequelize.Op.like]: `%${search.input.replace(' ', "%")}%`}})
          }
  
        }
        */
        
        const tipoEntSai = await db.TipoEntSai.findAll({
          attributes: ['codentsai', 'descricao'],
          order: [['descricao', 'asc']],
          where
        })

        res.status(200).json(tipoEntSai)

      } catch (error) {
        Exception.error(res, error)
      }
    //}).catch((error) => {
    //  res.status(400).json({message: error.message})
    //})
  }

  locais = async (req, res) => {
    //await Authorization.verify(req, res).then(async ({company}) => {
      try {

        const db = new AppContext()

        const where = [{}]

        const locais = await db.Local.findAll({
          attributes: ['codloc', 'descricao'],
          order: [['descricao', 'asc']],
          where
        })

        res.status(200).json(locais)

      } catch (error) {
        Exception.error(res, error)
      }
    //}).catch((error) => {
    //  res.status(400).json({message: error.message})
    //})
  }

  executeQuery = async (query, params = []) => {
    try {
      // Configuração de conexão
      const pool = await sql.connect({
        user: 'sa',
        password: '@Rped94ft',
        server: '191.252.205.101', // Ex: localhost ou IP do servidor
        database: 'atlanta',
        options: {
          encrypt: true, // Para Azure, defina como true
          trustServerCertificate: true, // Para produção, configure corretamente
        }
      });
  
      // Preparar a consulta com parâmetros
      const request = pool.request();

      // Checa se o parâmetro foi passado corretamente
      if (Array.isArray(params)) {
        params.forEach((param) => {
          if (param && param.name && param.type) {
            request.input(param.name, param.type, param.value);
          } else {
            throw new Error("Parâmetro inválido: ");
          }
        });
      }

      // Executando a consulta
      const result = await request.query(query);

      console.log(query)
    
      // Fechando a conexão
      await pool.close();
      return result.recordset; // Retorna os dados do recordset
    } catch (error) {
      throw error
    }
  }

  processMovimentos = async (ws, transacao) => {

    const db = new AppContext()

      //const wmovResults = await this.executeQuery(`SELECT * FROM skill_estoq_movitem WHERE transacao = ${transacao}`);
      const wmovResults = await db.MovItem.findAll({attributes: ['codprod', 'qtde', 'codloc1', 'codloc2'], where: [{transacao}]})

      for (const mov of wmovResults) {

        const wcodprod = mov.codprod?.toString().trim();
        const wqtde = parseFloat(mov.qtde);
    
        const processEstoque = async (codloc, isEntrada) => {

        if (codloc > 0) {

          const estoqueResults = await db.Estoque.findAll({attributes: ['saldo'], where: [{codprod: wcodprod, codloc}]})
          /*
          const estoqueResults = await this.executeQuery('SELECT * FROM skill_estoq_estoque WHERE codprod = @codprod AND codloc = @codloc',
            [
              { name: 'codprod', type: sql.NVarChar, value: wcodprod },
              { name: 'codloc', type: sql.Int, value: codloc }
            ]
          )
          */
  
          if (estoqueResults.length === 0) {
            //await db.MovItem.create({codprod: wcodprod, codloc, saldo: isEntrada ? wqtde : -wqtde})
            
            const saldo = isEntrada ? wqtde : -wqtde

            console.log('saldo: ', saldo)
            await this.executeQuery(`INSERT INTO skill_estoq_estoque (codprod, codloc, saldo) VALUES (${wcodprod}, ${codloc}, ${saldo})`

            )
          } else {
            const saldo = parseFloat(estoqueResults[0].saldo) + (isEntrada ? wqtde : -wqtde);
            await this.executeQuery('UPDATE skill_estoq_estoque SET saldo = @saldo WHERE codprod = @codprod AND codloc = @codloc',
              [
                { name: 'saldo', type: sql.Decimal, value: saldo },
                { name: 'codprod', type: sql.NVarChar, value: wcodprod },
                { name: 'codloc', type: sql.Int, value: codloc }
              ]
            )
          }
        }
      };
  
      await processEstoque(mov.codloc1, ws !== 1);
      await processEstoque(mov.codloc2, ws === 1);

    }


  }

}