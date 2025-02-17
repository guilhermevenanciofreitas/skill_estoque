import Sequelize from 'sequelize';

export class TipoEntSai {

  codentsai = {
    field: 'codentsai',
    type: Sequelize.NUMBER,
  }

  tipo = {
    field: 'tipo',
    type: Sequelize.STRING
  }

  descricao = {
    field: 'descricao',
    type: Sequelize.STRING
  }

  orig = {
    field: 'orig',
    type: Sequelize.STRING
  }

  dest = {
    field: 'dest',
    type: Sequelize.STRING
  }

}