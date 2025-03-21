import { Authorization } from "../authorization/authorization.js";
import { AppContext } from '../../database/index.js'
import Sequelize from "sequelize"
import { Exception } from "../../utils/exception.js";

export class SearchController {

    parceiro = async (req, res) => {
        //Authorization.verify(req, res).then(async ({company}) => {
            try {

                const db = new AppContext()

                const where = []

                if (req.body.tipo == 'S') {
                    where.push({tipo: 1})
                }

                if (req.body.tipo == 'E') {
                    where.push({tipo: 2})
                }

                where.push({
                    [Sequelize.Op.or]: [
                        {'$nome$': {[Sequelize.Op.like]: `%${req.body?.search.replace(' ', "%").toUpperCase()}%`}},
                    ],
                })

                const parceiros = await db.Parceiro.findAll({
                    attributes: ['codparc', 'nome'],
                    where,
                    order: [
                        ['nome', 'asc']
                    ],
                    limit: 20
                })

                res.status(200).json(parceiros)

            } catch (error) {
                Exception.error(res, error)
            }
        //}).catch((error) => {
        //    //Exception.unauthorized(res, error);
        //});
    }

    produto = async (req, res) => {
        //Authorization.verify(req, res).then(async ({company}) => {
            try {

                const db = new AppContext()

                const where = []

                where.push({
                    [Sequelize.Op.or]: [
                        {'$codprod$': {[Sequelize.Op.like]: req.body?.search}},
                        {'$descricao$': {[Sequelize.Op.like]: `%${req.body?.search.replace(' ', "%").toUpperCase()}%`}},
                    ],
                })

                const produtos = await db.Produto.findAll({
                    attributes: ['codprod', 'descricao', 'unidade', 'custo'],
                    where,
                    order: [
                        ['descricao', 'asc']
                    ],
                    limit: 20
                })

                res.status(200).json(produtos)

            } catch (error) {
                Exception.error(res, error)
            }
        //}).catch((error) => {
        //    //Exception.unauthorized(res, error);
        //});
    }

    tipoEntradaSaida = async (req, res) => {
        //Authorization.verify(req, res).then(async ({company}) => {
            try {

                const db = new AppContext()

                const where = []

                where.push({
                    [Sequelize.Op.or]: [
                        {'$descricao$': {[Sequelize.Op.like]: `%${req.body?.search.replace(' ', "%").toUpperCase()}%`}},
                    ],
                })

                const tipoEntSai = await db.TipoEntSai.findAll({
                    attributes: ['codentsai', 'descricao'],
                    where,
                    order: [
                        ['descricao', 'asc']
                    ],
                    limit: 20
                })

                res.status(200).json(tipoEntSai)

            } catch (error) {
                Exception.error(res, error)
            }
        //}).catch((error) => {
        //    //Exception.unauthorized(res, error);
        //});
    }

}