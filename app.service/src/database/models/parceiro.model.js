import Sequelize from 'sequelize';

export class Parceiro {

  codparc = {
    field: 'codparc',
    primaryKey: true,
    type: Sequelize.NUMBER,
  }

  tipo = {
    field: 'tipo',
    type: Sequelize.NUMBER,
  }

  nome = {
    field: 'nome',
    type: Sequelize.STRING,
  }

}