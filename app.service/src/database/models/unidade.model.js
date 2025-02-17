import Sequelize from 'sequelize';

export class Unidade {

  unidade = {
    field: 'unidade',
    type: Sequelize.STRING,
  }

  descricao = {
    field: 'descricao',
    type: Sequelize.STRING
  }

}