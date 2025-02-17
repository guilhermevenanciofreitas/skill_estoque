import express, { Router } from 'express'
import cors from 'cors'
import serverless from 'serverless-http'

import { ProdutoRoute } from './routes/cadastros/produto.route.js'
import { UnidadeRoute } from './routes/cadastros/unidade.route.js'
import { LocalRoute } from './routes/cadastros/local.route.js'
import { TipoEntSaiRoute } from './routes/cadastros/tipoEntSai.route.js'
import { ParceiroRoute } from './routes/cadastros/parceiro.route.js'
import { EntradaSaidaRoute } from './routes/cadastros/entradaSaida.route.js'
import { SearchRoute } from './routes/search.js'
import { RelatorioProdutoRoute } from './routes/relatorios/produto.route.js'

class App {

  express = express()

  constructor() {
    this.initializeMiddlewares()
    this.initializeRoutes()
  }

  initializeMiddlewares = () => {

    const corsOptions = {
      origin: '*',
      exposedHeaders: ['Last-Acess', 'Expire-In'],
    }

    this.express.use(cors(corsOptions))
    this.express.use(express.json())

  }

  initializeRoutes = () => {

    //this.express.use('/api/login', new LoginRoute().router)

    //Cadastros
    this.express.use('/api/entrada-saida', new EntradaSaidaRoute().router)

    this.express.use('/api/cadastros/produto', new ProdutoRoute().router)
    this.express.use('/api/cadastros/unidade', new UnidadeRoute().router)
    this.express.use('/api/cadastros/local', new LocalRoute().router)
    this.express.use('/api/cadastros/tipos-entrada-saida', new TipoEntSaiRoute().router)
    this.express.use('/api/cadastros/parceiro', new ParceiroRoute().router)

    //Relatorios
    this.express.use('/api/relatorios/produto', new RelatorioProdutoRoute().router)

    this.express.use('/api/search', new SearchRoute().router)

  }

  listen = (port) => {
    this.express.listen(port, () => {
      console.log(`Server running on port ${port}`)
    })
  }

}

export const app = new App()

export const handler = serverless(app.express)