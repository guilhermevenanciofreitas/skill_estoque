import React from 'react';
import { Routes, Route, useRoutes } from 'react-router-dom';
import { CustomProvider, Loader } from 'rsuite';
import enGB from 'rsuite/locales/en_GB';
import Frame from './components/Frame';
import DashboardPage from './views/dashboard';
import Error404Page from './views/errors/404';

import { appNavs } from './config';
import { BrowserRouter } from 'react-router-dom';


import EntradaSaida from './views/entrada-saida/index.entrada-saida';

//Cadastros
import CadastroProdutos from './views/cadastros/produtos/index.produtos'
import CadastroUnidades from './views/cadastros/unidades/index.unidades'
import CadastroLocais from './views/cadastros/local/index.locais'
import CadastroTipoEntSai from './views/cadastros/tipoEntSai/index.tipoEntSai'
import CadastroParceiro from './views/cadastros/parceiros/index.parceiros'

//Relatorios
import RelatorioProduto from './views/relatorios/index.produtos'

import ptBR from 'rsuite/locales/pt_BR';
import { IntlProvider } from 'react-intl';

export class Loading extends React.Component {

  static Show(message = 'Carregando...') {
    document.getElementById('loading').style.display = 'block'
  }

  static Hide() {
    document.getElementById('loading').style.display = 'none';
  }

  render() {
    return (
      <div id='loading' className="loader-overlay" style={{display: 'none'}}>
        <div className="loader-content loader-center">
          <div className="loader-center"><Loader size="lg" inverse content='Carregando...' /></div>
        </div>
      </div>
    );
  }

}

const App = () => {

  return (
    <>
      <Loading />
      <IntlProvider locale="zh">
        <CustomProvider locale={ptBR}>
          <Routes>
            
            {/*<Route path="sign-in" element={<SignInPage />} />*/}

            <Route path="/" element={<Frame navs={appNavs} />}>

              <Route index element={<EntradaSaida />} />

              <Route path="entrada-saida" element={<EntradaSaida />} />

              {/*Cadastros*/}
              <Route path='cadastros/produtos' element={<CadastroProdutos />} />
              <Route path='cadastros/unidades' element={<CadastroUnidades />} />
              <Route path='cadastros/locais' element={<CadastroLocais />} />
              <Route path='cadastros/tipos-entrada-saida' element={<CadastroTipoEntSai />} />
              <Route path='cadastros/parceiros' element={<CadastroParceiro />} />

              
              {/*Relatorios*/}
              <Route path='relatorios/produtos' element={<RelatorioProduto />} />

            </Route>
            
            <Route path="*" element={<Error404Page />} />

          </Routes>
        </CustomProvider>
      </IntlProvider>
    </>
  )
}

export default App;
