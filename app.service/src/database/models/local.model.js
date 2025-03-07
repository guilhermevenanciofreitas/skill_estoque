import Sequelize from 'sequelize';

export class Local {

  codloc = {
    field: 'codloc',
    primaryKey: true,
    type: Sequelize.NUMBER,
  }

  descricao = {
    field: 'descricao',
    type: Sequelize.STRING
  }

}