import Sequelize from "sequelize"
import { AppContext } from "../../database/index.js"
import { Exception } from "../../utils/exception.js"
import { Report } from "../../reports/index.js"

export class RelatorioLocalController {

  lista = async (req, res) => {
    //await Authorization.verify(req, res).then(async ({company}) => {
      try {

        const where = []
        
        const search = req.body.search

        if (search?.input) {

          if (search?.picker == 'descricao') {
            where.push({'descricao': {[Sequelize.Op.like]: `%${search.input.replace(' ', "%")}%`}})
          }

        }

        const db = new AppContext()

        const locais = await db.Local.findAndCountAll({
          attributes: ['codloc', 'descricao', [Sequelize.fn('SUM', Sequelize.col('estoques.saldo')), 'saldo_total']], include: [
            {model: db.Estoque, as: 'estoques', attributes: ['codloc', 'saldo'], include: [
              {model: db.Produto, as: 'produto', attributes: ['codprod', 'descricao']}
            ]}
          ],
          group: ['local.codloc', 'local.descricao', 'estoques.id', 'estoques.codloc', 'estoques.saldo', 'estoques.produto.id', 'estoques.produto.codprod', 'estoques.produto.descricao'],
          having: Sequelize.where(Sequelize.fn('SUM', Sequelize.col('estoques.saldo')), { [Sequelize.Op.gt]: 0 }),
          order: [['descricao', 'asc'], [{model: db.Estoque, as: 'estoques'}, {model: db.Produto, as: 'produto'}, 'descricao']],
          where
        })

        res.status(200).json({
          response: {
            rows: locais.rows
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

        const locais = await db.Local.findAll({
          attributes: ['codloc', 'descricao', [Sequelize.fn('SUM', Sequelize.col('estoques.saldo')), 'saldo_total']], include: [
            {model: db.Estoque, as: 'estoques', attributes: ['codloc', 'saldo'], include: [
              {model: db.Produto, as: 'produto', attributes: ['codprod', 'descricao', 'unidade', 'custo']}
            ]}
          ],
          group: ['local.codloc', 'local.descricao', 'estoques.id', 'estoques.codloc', 'estoques.saldo', 'estoques.produto.id', 'estoques.produto.codprod', 'estoques.produto.descricao', 'estoques.produto.unidade', 'estoques.produto.custo'],
          having: Sequelize.where(Sequelize.fn('SUM', Sequelize.col('estoques.saldo')), { [Sequelize.Op.gt]: 0 }),
          where: [{codloc: req.body[0]}],
          order: [['descricao', 'asc']]
        })

        console.log(locais)

        const report = await Report.generate({
          report: 'produto-local.html',
          title: 'Relatório de produtos',
          data: {
            items: locais
          }
        })
        
        res.status(200).json({pdf: report, locais})

      } catch (error) {
        Exception.error(res, error)
      }
    //}).catch((error) => {
    //  res.status(400).json({message: error.message})
    //})
  }

}