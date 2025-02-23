import { Sequelize } from 'sequelize'
import tedious from 'tedious'

import { Estoque } from './models/estoque.model.js'
import { Local } from './models/local.model.js'
import { Produto } from './models/produto.model.js'
import { Unidade } from './models/unidade.model.js'
import { TipoEntSai } from './models/tipoEntSai.model.js'
import { Parceiro } from './models/parceiro.model.js'
import { MovCab } from './models/movCab.model.js'
import { MovItem } from './models/movItem.model.js'

import 'dotenv/config'

export class AppContext extends Sequelize {
  
  Estoque = this.define('estoque', new Estoque(), { tableName: 'skill_estoq_estoque' })

  Local = this.define('local', new Local(), { tableName: 'skill_estoq_local' })

  MovCab = this.define('movCab', new MovCab(), { tableName: 'skill_estoq_movcab' })
  
  MovItem = this.define('movItem', new MovItem(), { tableName: 'skill_estoq_movitem' })

  Produto = this.define('produto', new Produto(), { tableName: 'skill_estoq_produto' })

  TipoEntSai = this.define('tipentsai', new TipoEntSai(), { tableName: 'skill_estoq_tipentsai' })

  Unidade = this.define('unidade', new Unidade(), { tableName: 'skill_estoq_unidade' })

  Parceiro = this.define('parceiro', new Parceiro(), { tableName: 'skill_estoq_parceiro' })

  constructor() {

    super({host: '191.252.205.101', port: 1433, database: 'atlanta', password: '@Rped94ft', username: 'sa', dialect: 'mssql', dialectModule: tedious, databaseVersion: '10.50.1600', timezone: "America/Sao_Paulo", dialectOptions: { options: { requestTimeout: 300000, encrypt: false }}, define: { timestamps: false }})

	  this.MovCab.belongsTo(this.Parceiro, {as: 'parceiro', foreignKey: 'codparc', targetKey: 'codparc'})
	  this.MovCab.belongsTo(this.TipoEntSai, {as: 'tipoEntSai', foreignKey: 'codentsai', targetKey: 'codentsai'})
	  this.MovCab.hasMany(this.MovItem, {as: 'items', foreignKey: 'transacao', targetKey: 'transacao'})

	  this.MovItem.belongsTo(this.Produto, {as: 'produto', foreignKey: 'codprod', targetKey: 'codprod'})
	  this.MovItem.belongsTo(this.Local, {as: 'orig', foreignKey: 'codloc1', targetKey: 'codloc'})
	  this.MovItem.belongsTo(this.Local, {as: 'dest', foreignKey: 'codloc2', targetKey: 'codloc'})

	  this.Produto.hasMany(this.Estoque, {as: 'estoques', foreignKey: 'codprod', targetKey: 'codprod'})

	  this.Local.hasMany(this.Estoque, {as: 'estoques', foreignKey: 'codloc', targetKey: 'codloc'})

    this.Estoque.belongsTo(this.Produto, {as: 'produto', foreignKey: 'codprod', targetKey: 'codprod'})
    this.Estoque.belongsTo(this.Local, {as: 'local', foreignKey: 'codloc', targetKey: 'codloc'})

  }

}