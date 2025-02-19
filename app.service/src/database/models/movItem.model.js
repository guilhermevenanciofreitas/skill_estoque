import Sequelize from 'sequelize';

export class MovItem {

  transacao = {
    field: 'transacao',
    type: Sequelize.NUMBER,
  }

  codprod = {
    field: 'codprod',
    type: Sequelize.NUMBER,
  }

  qtde = {
    field: 'qtde',
    type: Sequelize.DECIMAL,
  }

  punit = {
    field: 'punit',
    type: Sequelize.DECIMAL,
  }

  codloc1 = {
    field: 'codloc1',
    type: Sequelize.NUMBER,
  }

  codloc2 = {
    field: 'codloc2',
    type: Sequelize.NUMBER,
  }

}