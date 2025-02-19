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
import { Exception } from "../../utils/exception.js"

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
              {model: db.MovItem, as: 'items', attributes: ['id', 'qtde', 'punit'], include: [
                {model: db.Produto, as: 'produto', attributes: ['codprod', 'descricao']}
              ]}
            ],
            where: [{transacao}],
            transaction
          })

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

        console.log(movCab)

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
          }

        })

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

}