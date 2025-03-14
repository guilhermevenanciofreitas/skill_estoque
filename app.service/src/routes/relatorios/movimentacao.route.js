import { Router } from 'express'
import { RelatorioMovimentacaoController } from '../../controllers/relatorios/movimentacao.controller.js'

export class RelatorioMovimentacaoRoute {

    router = Router()
    controller = new RelatorioMovimentacaoController()

    constructor() {
        this.intializeRoutes()
    }

    intializeRoutes() {
        this.router.post('/lista', async (req, res) => await this.controller.lista(req, res))
        this.router.post('/imprimir', async (req, res) => await this.controller.imprimir(req, res))
    }

}