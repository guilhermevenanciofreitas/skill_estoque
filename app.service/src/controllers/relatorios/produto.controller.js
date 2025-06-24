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

        const produtos = await db.Produto.findAll({
          attributes: [
            'codprod',
            'descricao',
            'unidade',
            [
              Sequelize.literal(`(
                SELECT SUM(saldo)
                FROM skill_estoq_estoque AS e
                WHERE e.codprod = produto.codprod
              )`),
              'saldo_total'
            ]
          ],
          include: [
            {
              model: db.Estoque,
              as: 'estoques',
              attributes: ['codloc', 'saldo', 'codprod'],
              where: {
                saldo: { [Sequelize.Op.gt]: 0 } // Opcional, filtrar apenas com saldo > 0
              },
              include: [
                {
                  model: db.Local,
                  as: 'local',
                  attributes: ['codloc', 'descricao']
                }
              ]
            }
          ],
          where,
          order: [
            ['descricao', 'ASC'],
            [{ model: db.Estoque, as: 'estoques' }, { model: db.Local, as: 'local' }, 'descricao', 'ASC']
          ]
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
    try {

      const db = new AppContext();
      
      const { codemp, search } = req.body;

      if (!codemp) {
        return res.status(400).json({ message: 'Código da empresa (codemp) é obrigatório.' });
      }

      const where = [];

      // Filtro pela empresa nos estoques relacionados
      where.push({ '$estoques.codemp$': codemp });

      // Filtro por descrição, se fornecido
      if (search?.input && search?.picker === 'descricao') {
        where.push({
          descricao: {
            [Sequelize.Op.like]: `%${search.input.replace(/ /g, '%')}%`
          }
        });
      }

      const produtos = await db.Produto.findAll({
        attributes: [
          'codprod',
          'descricao',
          'unidade',
          [Sequelize.fn('SUM', Sequelize.col('estoques.saldo')), 'saldo_total']
        ],
        include: [
          {
            model: db.Estoque,
            as: 'estoques',
            attributes: []
          }
        ],
        where,
        group: ['Produto.codprod', 'Produto.descricao', 'Produto.unidade'],
        having: Sequelize.where(
          Sequelize.fn('SUM', Sequelize.col('estoques.saldo')),
          { [Sequelize.Op.gt]: 0 }
        ),
        order: [['descricao', 'ASC']]
      });

      const empresa =
        codemp === 1
          ? 'GASTROBAR'
          : codemp === 2
          ? 'RESTAURANTE GUARANY'
          : 'RESTAURANTE 242';

      const report = await Report.generate({
        report: 'produto-estoque.html',
        title: 'Relatório de produtos',
        data: { items: produtos },
        empresa
      });

      res.status(200).json({ pdf: report });

    } catch (error) {
      Exception.error(res, error);
    }
  };


}