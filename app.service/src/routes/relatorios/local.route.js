import { Router } from 'express'
import { RelatorioLocalController } from '../../controllers/relatorios/local.controller.js'

export class RelatorioLocalRoute {

    router = Router()
    controller = new RelatorioLocalController()

    constructor() {
        this.intializeRoutes()
    }

    intializeRoutes() {
        this.router.post('/lista', async (req, res) => await this.controller.lista(req, res))
        this.router.post('/imprimir', async (req, res) => await this.controller.imprimir(req, res))
    }

}