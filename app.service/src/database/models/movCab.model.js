import Sequelize from 'sequelize';

export class MovCab {

  transacao = {
    field: 'transacao',
    type: Sequelize.NUMBER,
  }

  codentsai = {
    field: 'codentsai',
    type: Sequelize.NUMBER,
  }

  codparc = {
    field: 'codparc',
    type: Sequelize.NUMBER,
  }

  emissao = {
    field: 'emissao',
    type: Sequelize.STRING,
  }

  dtmov = {
    field: 'dtmov',
    type: Sequelize.STRING,
  }

  numdoc = {
    field: 'numdoc',
    type: Sequelize.STRING,
  }

  total = {
    field: 'total',
    type: Sequelize.NUMBER,
  }

  inclusao = {
    field: 'inclusao',
    type: Sequelize.STRING,
  }

  alteracao = {
    field: 'alteracao',
    type: Sequelize.STRING,
  }

  obs = {
    field: 'obs',
    type: Sequelize.STRING,
  }

  codemp = {
    field: 'codemp',
    type: Sequelize.INTEGER
  }

}