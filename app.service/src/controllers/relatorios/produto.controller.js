import Sequelize from "sequelize"
import { AppContext } from "../../database/index.js"
import { Exception } from "../../utils/exception.js"
import { Report } from "../../reports/index.js"

export class RelatorioProdutoController {

  lista = async (req, res) => {
    //await Authorization.verify(req, res).then(async ({company}) => {
      try {

        const db = new AppContext()

        const produtos = await db.Produto.findAll({
          attributes: ['codprod', 'descricao', 'unidade', [Sequelize.fn('SUM', Sequelize.col('estoques.saldo')), 'saldo_total']],
          include: [
            {model: db.Estoque, as: 'estoques', attributes: ['codloc', 'saldo'], include: [
              {model: db.Local, as: 'local', attributes: ['codloc', 'descricao']}
            ]}
          ],
          group: ['produto.codprod', 'produto.descricao', 'produto.unidade', 'estoques.id', 'estoques.codloc', 'estoques.saldo', 'estoques.local.id', 'estoques.local.codloc', 'estoques.local.descricao'],
          having: Sequelize.where(Sequelize.fn('SUM', Sequelize.col('estoques.saldo')), { [Sequelize.Op.gt]: 0 }),
          order: [['descricao', 'ASC']]
        })

        res.status(200).json({
          response: {
            rows: produtos
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

        const produtos = await db.Produto.findAll({
          attributes: ['codprod', 'descricao', 'unidade', [Sequelize.fn('SUM', Sequelize.col('estoques.saldo')), 'saldo_total'], 'custo'],
          include: [
            {model: db.Estoque, as: 'estoques', attributes: ['saldo']}
          ],
          group: ['produto.codprod', 'produto.descricao', 'produto.unidade', 'produto.custo', 'estoques.id', 'estoques.saldo'],
          having: Sequelize.where(Sequelize.fn('SUM', Sequelize.col('estoques.saldo')), { [Sequelize.Op.gt]: 0 }),
          order: [['descricao', 'ASC']]
        })

        const report = await Report.generate({
          report: 'produto-estoque.html',
          title: 'Relatório de produtos',
          data: {
            items: produtos
          }
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