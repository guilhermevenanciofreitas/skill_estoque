import Sequelize from 'sequelize';

export class Estoque {

  codprod = {
    field: 'codprod',
    type: Sequelize.NUMBER,
  }

  codloc = {
    field: 'codloc',
    type: Sequelize.NUMBER
  }

  saldo = {
    field: 'saldo',
    type: Sequelize.DECIMAL
  }

  codemp = {
    field: 'codemp',
    type: Sequelize.INTEGER
  }

}