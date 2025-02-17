import Sequelize from 'sequelize';

export class Local {

  codloc = {
    field: 'codloc',
    type: Sequelize.NUMBER,
  }

  descricao = {
    field: 'descricao',
    type: Sequelize.STRING
  }

}