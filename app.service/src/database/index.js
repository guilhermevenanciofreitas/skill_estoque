import { Sequelize } from 'sequelize'
import tedious from 'tedious'
import 'dotenv/config'

import { Estoque } from './models/estoque.model.js'
import { Local } from './models/local.model.js'
import { Produto } from './models/produto.model.js'
import { Unidade } from './models/unidade.model.js'
import { TipoEntSai } from './models/tipoEntSai.model.js'
import { Parceiro } from './models/parceiro.model.js'
import { MovCab } from './models/movCab.model.js'

export class AppContext extends Sequelize {
  
  Estoque = this.define('estoque', new Estoque(), { tableName: 'skill_estoq_estoque' })

  Local = this.define('estoque', new Local(), { tableName: 'skill_estoq_local' })

  MovCab = this.define('movCab', new MovCab(), { tableName: 'skill_estoq_movcab' })

  Produto = this.define('produto', new Produto(), { tableName: 'skill_estoq_produto' })

  TipoEntSai = this.define('tipentsai', new TipoEntSai(), { tableName: 'skill_estoq_tipentsai' })

  Unidade = this.define('unidade', new Unidade(), { tableName: 'skill_estoq_unidade' })

  Parceiro = this.define('parceiro', new Parceiro(), { tableName: 'skill_estoq_parceiro' })

  constructor() {

    super({host: '191.252.205.101', port: 1433, database: 'atlanta', password: '@Rped94ft', username: 'sa', dialect: 'mssql', dialectModule: tedious, databaseVersion: '10.50.1600', timezone: "America/Sao_Paulo", dialectOptions: { options: { requestTimeout: 300000, encrypt: false }}, define: { timestamps: false }})

	  this.MovCab.belongsTo(this.Parceiro, {as: 'parceiro', foreignKey: 'codparc', targetKey: 'codparc'})
	  this.MovCab.belongsTo(this.TipoEntSai, {as: 'tipoEntSai', foreignKey: 'codentsai', targetKey: 'codentsai'})

	  this.Produto.hasMany(this.Estoque, {as: 'estoque', foreignKey: 'codprod', targetKey: 'codprod'})

    
	  this.Estoque.hasMany(this.Produto, {as: 'produto', foreignKey: 'codprod', targetKey: 'codprod'})
	  this.Estoque.hasMany(this.Local, {as: 'local', foreignKey: 'codloc', targetKey: 'codloc'})

    //this.Cte.hasMany(this.CteNfe, {as: 'cteNfes', foreignKey: 'cteId'})

  }

}