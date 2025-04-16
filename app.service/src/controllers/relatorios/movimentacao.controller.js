import Sequelize from "sequelize"
import { AppContext } from "../../database/index.js"
import { Exception } from "../../utils/exception.js"
import { Report } from "../../reports/index.js"

export class RelatorioMovimentacaoController {

  lista = async (req, res) => {
    //await Authorization.verify(req, res).then(async ({company}) => {
      try {

        const db = new AppContext()

        const where = []

        where.push({'$movCab.codemp$': req.body.codemp})

        where.push({'$movCab.emissao$': {[db.Sequelize.Op.between]: [req.body.inicio, req.body.final]}})

        if (req.body.tipoEntSai?.codentsai) {
          where.push({'$movCab.codentsai$': req.body.tipoEntSai?.codentsai})
        }

        if (req.body.produto?.codprod) {
          where.push({'$movItem.codprod$': req.body.produto?.codprod})
        }

        const items = await db.MovItem.findAndCountAll({
          attributes: ['codprod', 'punit', 'qtde'],
          include: [
            {model: db.MovCab, as: 'movCab', attributes: ['transacao', 'emissao'], include: [
              {model: db.Parceiro, as: 'parceiro', attributes: ['nome']}
            ]},
            {model: db.Produto, as: 'produto', attributes: ['codprod', 'descricao']},
            {model: db.Local, as: 'orig', attributes: ['descricao']},
            {model: db.Local, as: 'dest', attributes: ['descricao']}
          ],
          where,
          order: [[{model: db.Produto, as: 'produto'}, 'descricao', 'ASC']]
        })

        res.status(200).json({
          response: {
            rows: items.rows, count: items.count
          }
        })

      } catch (error) {
        Exception.error(res, error)
      }
    //}).catch((error) => {
    //  res.status(400).json({message: error.message})
    //})
  }

  imprimir = async (req, res) => {
    //await Authorization.verify(req, res).then(async ({company}) => {
      try {

        const db = new AppContext()

        const where = []

        where.push({'$movCab.codemp$': req.body.codemp})
        
        where.push({'$movCab.emissao$': {[db.Sequelize.Op.between]: [req.body.inicio, req.body.final]}})

        if (req.body.tipoEntSai?.codentsai) {
          where.push({'$movCab.codentsai$': req.body.tipoEntSai?.codentsai})
        }

        if (req.body.produto?.codprod) {
          where.push({'$movItem.codprod$': req.body.produto?.codprod})
        }

        const items = await db.MovItem.findAll({
          attributes: ['codprod', 'punit', 'qtde'],
          include: [
            {model: db.MovCab, as: 'movCab', attributes: ['transacao', 'emissao'], include: [
              {model: db.Parceiro, as: 'parceiro', attributes: ['nome']}
            ]},
            {model: db.Produto, as: 'produto', attributes: ['codprod', 'descricao']},
            {model: db.Local, as: 'orig', attributes: ['descricao']},
            {model: db.Local, as: 'dest', attributes: ['descricao']}
          ],
          where,
          order: [[{model: db.Produto, as: 'produto'}, 'descricao', 'ASC']]
        })

        const empresa = req.body.codemp == 1 ? 'GASTROBAR' : req.body.codemp == 2 ? 'RESTAURANTE GUARANY' : 'RESTAURANTE 242'

        const report = await Report.generate({
          report: 'movimentacao.html',
          title: 'Relatório de movimentação',
          landscape: true,
          data: {
            items: items
          },
          empresa
        });

        res.status(200).json({pdf: report})

      } catch (error) {
        Exception.error(res, error)
      }
    //}).catch((error) => {
    //  res.status(400).json({message: error.message})
    //})
  }

}