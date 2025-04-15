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

  tipoOperacoes = async (req, res) => {
    //await Authorization.verify(req, res).then(async ({company}) => {
      try {

        const db = new AppContext()

        const { tipo } = req.body

        const where = [{tipo}]

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

  lista = async (req, res) => {
    //await Authorization.verify(req, res).then(async ({company}) => {
      try {

        const db = new AppContext()

        const limit = req.body.limit || 50
        const offset = req.body.offset || 0
        const search = req.body.search

        const where = []

        where.push({'codemp': req.body.codemp})

        const movCabs = await db.MovCab.findAndCountAll({
          attributes: ['transacao', 'emissao', 'dtmov', 'numdoc', 'total', 'obs'],
          include: [
            {model: db.Parceiro, as: 'parceiro', attributes: ['nome']},
            {model: db.TipoEntSai, as: 'tipoEntSai', attributes: ['tipo', 'descricao']}
          ],
          limit: limit,
          offset: offset * limit,
          order: [['transacao', 'desc']],
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
          emissao: req.body.emissao,
          dtmov: req.body.dtmov,
          numdoc: req.body.numdoc,
          total: req.body.total,
          obs: req.body.obs,
          codemp: req.body.codemp
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

            const movItemsAnterior = await db.MovItem.findAll({
              include: [
                {model: db.Produto, as: 'produto'},
                {model: db.Local, as: 'orig'},
                {model: db.Local, as: 'dest'}
              ],
              where: [{transacao: movCab.transacao}]
            })

            await this.atualizarEstoque(-1, movCab.transacao, _.cloneDeep(movItemsAnterior), req.body.codemp, transaction) // Reverte estoque antigo

            await db.MovItem.destroy({where: [{transacao: movCab.transacao}], transaction})

          }

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

          await this.atualizarEstoque(1, movCab.transacao, _.cloneDeep(movItems), req.body.codemp, transaction) // Aplica novo estoque

        })

        res.status(200).json(movCab)

      } catch (error) {
        Exception.error(res, error)
      }
    //}).catch((error) => {
    //  res.status(400).json({message: error.message})
    //})
  }

  atualizarEstoque = async (multiplicador, transacao, movItems, codemp, transaction) => {

    const db = new AppContext();

    const movCab = await db.MovCab.findOne({ where: { transacao }, transaction, include: [{ model: db.TipoEntSai, as: 'tipoEntSai' }] })
    
    for (const item of movItems) {

      console.log(item.dataValues)

      const fator = parseFloat(item.qtde) * multiplicador

      if (movCab.tipoEntSai.tipo === 'E') {

        if (!item.dest) {
          item.dest = item.orig
        }

        let estoqueDest = await db.Estoque.findOne({ where: { codprod: item.produto.codprod, codloc: item.dest.codloc, codemp }, transaction })

        const estoque = parseFloat(estoqueDest?.saldo || 0)

        if (estoqueDest) {
          await db.Estoque.update(
            { saldo: estoque + fator },
            { where: { codprod: item.produto.codprod, codloc: item.dest.codloc, codemp }, transaction }
          )
        } else {
          await db.Estoque.create(
            { codprod: item.produto.codprod, codloc: item.dest.codloc, saldo: fator, codemp },
            { transaction }
          )
        }
      } else if (movCab.tipoEntSai.tipo === 'S') {

        if (!item.orig) {
          item.orig = item.dest
        }

        let estoqueOrig = await db.Estoque.findOne({ where: { codprod: item.produto.codprod, codloc: item.orig.codloc, codemp }, transaction })

        const estoque = parseFloat(estoqueOrig?.saldo || 0)

        if (estoqueOrig) {
          await db.Estoque.update(
            { saldo: estoque - fator },
            { where: { codprod: item.produto.codprod, codloc: item.orig.codloc, codemp }, transaction }
          )
        }

      } else if (movCab.tipoEntSai.tipo === 'A') {

        let estoqueOrig = await db.Estoque.findOne({ where: { codprod: item.produto.codprod, codloc: item.orig.codloc, codemp }, transaction })
        let estoqueDest = await db.Estoque.findOne({ where: { codprod: item.produto.codprod, codloc: item.dest.codloc, codemp }, transaction })
      
        if (estoqueOrig) {
          await db.Estoque.update(
            { saldo: parseFloat(estoqueOrig?.saldo || 0) - fator },
            { where: { codprod: item.produto.codprod, codloc: item.orig.codloc, codemp }, transaction }
          )
        }
        if (estoqueDest) {
          await db.Estoque.update(
            { saldo: parseFloat(estoqueDest?.saldo || 0) + fator },
            { where: { codprod: item.produto.codprod, codloc: item.dest.codloc, codemp }, transaction }
          )
        } else {
          await db.Estoque.create(
            { codprod: item.produto.codprod, codloc: item.dest.codloc, saldo: fator, codemp },
            { transaction }
          )
        }
      }
    }
  }

}