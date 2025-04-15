import React, { useEffect, useState } from 'react';
import { Routes, Route, useRoutes, Navigate } from 'react-router-dom';
import { CustomProvider, Loader } from 'rsuite';
import enGB from 'rsuite/locales/en_GB';
import Frame from './components/Frame';
import DashboardPage from './views/dashboard';
import Error404Page from './views/errors/404';

import { appNavs } from './config';
import { BrowserRouter } from 'react-router-dom';


import EntradaSaida from './views/entrada-saida/index.entrada-saida';

//Cadastros
import { CadastroProdutos } from './views/cadastros/produtos/index.produtos'
import { CadastroUnidades } from './views/cadastros/unidades/index.unidades'
import { CadastroLocais } from './views/cadastros/local/index.locais'
import CadastroTipoEntSai from './views/cadastros/tipoEntSai/index.tipoEntSai'
import { CadastroParceiros } from './views/cadastros/parceiros/index.parceiros'

//Relatorios
import RelatorioProduto from './views/relatorios/index.produtos'

import ptBR from 'rsuite/locales/pt_BR';
import { IntlProvider } from 'react-intl';
import { RelatorioLocal } from './views/relatorios/index.local';
import { RelatorioMovimentacao } from './views/relatorios/index.movimentacao';
import { RelatorioResumo } from './views/relatorios/index.resumo';
import { SignIn } from './views/sign-in/SignIn';

export class Loading extends React.Component {

  static Show(message = 'Carregando...') {
    
    var loaderElement = document.getElementById('loader')
  
    if (loaderElement) {
      loaderElement.setAttribute('content', message)
    }

    document.getElementById('loading').style.display = 'block'
    
  }

  static Hide() {
    document.getElementById('loading').style.display = 'none';
  }

  render() {
    return (
      <div id='loading' className="loader-overlay" style={{display: 'none'}}>
        <div className="loader-content loader-center">
          <div className="loader-center"><Loader id='loader' size="lg" inverse content='Carregando...' /></div>
        </div>
      </div>
    );
  }

}


export const checkAuthorization = () => {

  const authData = localStorage.getItem("Authorization")

  if (!authData) {
    return false
  }

  const { token, lastAcess, expireIn } = JSON.parse(authData);

  return true

  if (!token || !lastAcess || !expireIn) {
    return false
  }

  const expirationTime = Number(lastAcess) + Number(expireIn) * 60 * 1000

  if (Date.now() >= expirationTime) {
    return false
  } else {
    return true
  }

}

const PrivateRoute = ({ component }) => {

  const [isAuthenticated, setIsAuthenticated] = useState(null)

  useEffect(() => {

    let animationFrameId

    const checkAuth = () => {

      const isAuth = checkAuthorization()

      if (!isAuth) {
        setIsAuthenticated(false)
      } else {
        setIsAuthenticated(true)
        animationFrameId = requestAnimationFrame(checkAuth)
      }
    }

    checkAuth()

    return () => cancelAnimationFrame(animationFrameId)

  }, [])

  if (isAuthenticated === null) {
    return null
  }

  const redirect = window.location.pathname == '/' ? '' : `?redirect=${window.location.pathname}`

  return isAuthenticated ? component : <Navigate to={`/login${redirect}`} replace />

}


const App = () => {

  return (
    <>
      <Loading />
      <IntlProvider locale="zh">
        <CustomProvider locale={ptBR}>
          <Routes>
            
            {/*<Route path="sign-in" element={<SignInPage />} />*/}

            <Route path="login" element={<SignIn />} />

            <Route path="/" element={<PrivateRoute component={<Frame navs={appNavs} />} />}>

              <Route index element={<EntradaSaida />} />

              <Route path="entrada-saida" element={<EntradaSaida />} />

              {/*Cadastros*/}
              <Route path='cadastros/produtos' element={<CadastroProdutos />} />
              <Route path='cadastros/unidades' element={<CadastroUnidades />} />
              <Route path='cadastros/locais' element={<CadastroLocais />} />
              <Route path='cadastros/tipos-entrada-saida' element={<CadastroTipoEntSai />} />
              <Route path='cadastros/parceiros' element={<CadastroParceiros />} />

              
              {/*Relatorios*/}
              <Route path='relatorios/movimentacao' element={<RelatorioMovimentacao />} />
              <Route path='relatorios/resumo' element={<RelatorioResumo />} />
              <Route path='relatorios/produto' element={<RelatorioProduto />} />
              <Route path='relatorios/local' element={<RelatorioLocal />} />

            </Route>
            
            <Route path="*" element={<Error404Page />} />

          </Routes>
        </CustomProvider>
      </IntlProvider>
    </>
  )
}

export default App;
