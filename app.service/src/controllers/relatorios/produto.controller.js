import Sequelize from "sequelize"
import { AppContext } from "../../database/index.js"
import { Exception } from "../../utils/exception.js"
import { Report } from "../../reports/index.js"

export class RelatorioProdutoController {

  lista = async (req, res) => {
    //await Authorization.verify(req, res).then(async ({company}) => {
      try {

        const where = []

        where.push({'$estoques.codemp$': req.body.codemp})

        const search = req.body.search

        if (search?.input) {

          if (search?.picker == 'descricao') {
            where.push({'descricao': {[Sequelize.Op.like]: `%${search.input.replace(' ', "%")}%`}})
          }

        }

        const db = new AppContext()

        const produtos = await db.Produto.findAndCountAll({
          attributes: ['codprod', 'descricao', 'unidade', [Sequelize.fn('SUM', Sequelize.col('estoques.saldo')), 'saldo_total']],
          include: [
            {model: db.Estoque, as: 'estoques', attributes: ['codloc', 'saldo'], include: [
              {model: db.Local, as: 'local', attributes: ['codloc', 'descricao']}
            ]}
          ],
          group: ['produto.codprod', 'produto.descricao', 'produto.unidade', 'estoques.id', 'estoques.codloc', 'estoques.saldo', 'estoques.local.id', 'estoques.local.codloc', 'estoques.local.descricao'],
          having: Sequelize.where(Sequelize.fn('SUM', Sequelize.col('estoques.saldo')), { [Sequelize.Op.gt]: 0 }),
          order: [['descricao', 'ASC'], [{ model: db.Estoque, as: 'estoques' }, { model: db.Local, as: 'local' }, 'descricao', 'ASC']],
          where
        })

        res.status(200).json({
          response: {
            rows: produtos.rows
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

        where.push({'$estoques.codemp$': req.body.codemp})

        const produtos = await db.Produto.findAll({
          attributes: ['codprod', 'descricao', 'unidade', [Sequelize.fn('SUM', Sequelize.col('estoques.saldo')), 'saldo_total'], 'custo'],
          include: [
            {model: db.Estoque, as: 'estoques', attributes: ['saldo']}
          ],
          where,
          group: ['produto.codprod', 'produto.descricao', 'produto.unidade', 'produto.custo', 'estoques.id', 'estoques.saldo'],
          having: Sequelize.where(Sequelize.fn('SUM', Sequelize.col('estoques.saldo')), { [Sequelize.Op.gt]: 0 }),
          order: [['descricao', 'ASC']]
        })

        const empresa = req.body.codemp == 1 ? 'GASTROBAR' : req.body.codemp == 2 ? 'RESTAURANTE GUARANY' : 'RESTAURANTE 242'

        const report = await Report.generate({
          report: 'produto-estoque.html',
          title: 'Relatório de produtos',
          data: {
            items: produtos
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