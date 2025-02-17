import Sequelize from 'sequelize';

export class Produto {

  codprod = {
    field: 'codprod',
    type: Sequelize.NUMBER,
  }

  descricao = {
    field: 'descricao',
    type: Sequelize.STRING
  }

  unidade = {
    field: 'unidade',
    type: Sequelize.STRING
  }

  custo = {
    field: 'custo',
    type: Sequelize.DECIMAL
  }

}