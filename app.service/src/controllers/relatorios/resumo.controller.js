import Sequelize from "sequelize"
import { AppContext } from "../../database/index.js"
import { Exception } from "../../utils/exception.js"
import { Report } from "../../reports/index.js"

export class RelatorioResumoController {

  lista = async (req, res) => {
    //await Authorization.verify(req, res).then(async ({company}) => {
      try {

        const db = new AppContext()

        /*
        const where = []

        where.push({'$movCab.emissao$': {[db.Sequelize.Op.between]: [req.body.inicio, req.body.final]}})

        if (req.body.tipoEntSai?.codentsai) {
          where.push({'$movCab.codentsai$': req.body.tipoEntSai?.codentsai})
        }

        if (req.body.produto?.codprod) {
          where.push({'$movItem.codprod$': req.body.produto?.codprod})
        }
        */

        const resumo = await db.query(`
          select mc.codentsai, es.descricao operacao, sum(mi.qtde * punit) valor
          from skill_estoq_movitem mi
          left join skill_estoq_movcab mc on mc.transacao = mi.transacao and mc.codemp = ${req.body.codemp}
          left join skill_estoq_tipentsai es on es.codentsai = mc.codentsai
          where mc.emissao between '${req.body.inicio} 00:00:00' and '${req.body.final} 23:59:59'
          group by mc.codentsai, es.descricao
          order by es.descricao asc`,
          {type: Sequelize.QueryTypes.SELECT}
        )

        res.status(200).json({
          response: {
            resumo
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

        const resumo = await db.query(`
          select mc.codentsai, es.descricao operacao, sum(mi.qtde * punit) valor
          from skill_estoq_movitem mi
          left join skill_estoq_movcab mc on mc.transacao = mi.transacao and mc.codemp = ${req.body.codemp}
          left join skill_estoq_tipentsai es on es.codentsai = mc.codentsai
          where mc.emissao between '${req.body.inicio} 00:00:00' and '${req.body.final} 23:59:59'
          group by mc.codentsai, es.descricao
          order by es.descricao asc`,
          {type: Sequelize.QueryTypes.SELECT}
        )

        const report = await Report.generate({
          report: 'resumo.html',
          title: 'Resumo de movimentação',
          data: {
            items: resumo
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