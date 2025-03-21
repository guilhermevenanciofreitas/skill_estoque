import { Router } from 'express'
import { RelatorioResumoController } from '../../controllers/relatorios/resumo.controller.js'

export class RelatorioResumoRoute {

    router = Router()
    controller = new RelatorioResumoController()

    constructor() {
        this.intializeRoutes()
    }

    intializeRoutes() {
        this.router.post('/lista', async (req, res) => await this.controller.lista(req, res))
        this.router.post('/imprimir', async (req, res) => await this.controller.imprimir(req, res))
    }

}