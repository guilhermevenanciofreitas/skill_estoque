import { AppContext } from '../database/index.js';

import axios from 'axios';
import qs from 'qs';

export class MercadoLivre {

  //600 - success
  //601 - redirect auth.mercadolivre.com.br
  static async verify(options, companyId) {

    const db = new AppContext(options);

    var company = await db.Company.findOne({attributes: ['id', 'mercadoLivre'], where: [{id: companyId}]});

    if (!company.mercadoLivre?.id) {
      throw new Error('E necessário realizar o login!');
    }

    let data = qs.stringify({
      grant_type: 'refresh_token', 
      client_id: '1928835050355270', 
      client_secret: 'HS4Bo6e3KHgQF8jpRZvGg7zXjWFv7ybi', 
      refresh_token: company.mercadoLivre?.refresh_token
    });

    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://api.mercadolibre.com/oauth/token',
      headers: { 
        'accept': 'application/json', 
        'content-type': 'application/x-www-form-urlencoded'
      },
      data : data
    };

    const r = await axios.request(config);

    company.mercadoLivre = {...company.mercadoLivre, refresh_token: r.data.refresh_token};

    await company.save();

    return  {id: company.mercadoLivre?.id, access_token: r.data.access_token};

  }

}


export class MercadoPago {

  //600 - success
  //601 - redirect auth.mercadolivre.com.br
  static async verify(options, companyId) {

    const db = new AppContext(options);

    var company = await db.Company.findOne({attributes: ['id', 'mercadoLivre'], where: [{id: companyId}]});

    if (!company.mercadoLivre?.id) {
      throw new Error('E necessário realizar o login!');
    }

    let data = qs.stringify({
      grant_type: 'refresh_token', 
      client_id: '1928835050355270', 
      client_secret: 'HS4Bo6e3KHgQF8jpRZvGg7zXjWFv7ybi', 
      refresh_token: company.mercadoLivre?.refresh_token
    });

    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://api.mercadopago.com/oauth/token',
      headers: { 
        'accept': 'application/json', 
        'content-type': 'application/x-www-form-urlencoded'
      },
      data : data
    };

    const r = await axios.request(config);

    company.mercadoLivre = {...company.mercadoLivre, refresh_token: r.data.refresh_token};

    await company.save();

    return  {id: company.mercadoLivre?.id, access_token: r.data.access_token};

  }

}