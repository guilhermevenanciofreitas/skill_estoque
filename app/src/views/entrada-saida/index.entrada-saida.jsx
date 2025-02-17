import React from 'react'
import { Badge, Button, HStack, IconButton, List, Nav, Panel, Popover, Stack, Whisper } from 'rsuite'

import dayjs from 'dayjs'

import PageContent from '../../components/PageContent'

import { CustomBreadcrumb, CustomPagination, CustomSearch, DataTable } from '../../controls'
import { FaEllipsisV, FaFileDownload, FaPrint, FaUpload } from 'react-icons/fa'
import { Service } from '../../service'

import ViewEntradaSaida from './view.entrada-saida'

import _ from 'lodash'
import { times } from 'lodash'

const fields = [
  { label: 'Descrição', value: 'descricao' },
]

class EntradaSaida extends React.Component {

  ViewEntradaSaida = React.createRef()

  componentDidMount = () => {
    this.onSearch()
  }

  onApplyDate = (date) => {
    //this.setState({request: {date}})
  }

  onApplyFilter = (filter) => {
    this.setState({request: {filter}}, () => this.onSearch())
  }

  onSearch = () => {
    this.setState({loading: true}, async () => {
      try {
        await new Service().Post('entrada-saida/lista', this.state.request).then((result) => this.setState({...result.data})).finally(() => this.setState({loading: false}))
      } catch (error) {
        console.error(error.message)
      }
    })
  }

  onEditarEntradaSaida = async (unidade) => {
    this.ViewEntradaSaida.current.editarEntradaSaida(unidade).then((cte) => {
      if (cte) this.onSearch()
    })
  }

  onNovaEntradaSaida = () => {
    this.ViewEntradaSaida.current.novaEntradaSaida({tipo: 1}).then((cte) => {
      if (cte) this.onSearch()
    })
  }

  columns = [
    { selector: (row) => row.transacao, name: 'Cod. ID', minWidth: '100px', maxWidth: '100px'},
    { selector: (row) => row.tipoEntSai.tipo, name: 'Tipo', minWidth: '100px', maxWidth: '100px'},
    { selector: (row) => row.tipoEntSai.descricao, name: 'Descrição do tipo', minWidth: '220px', maxWidth: '220px'},
    { selector: (row) => row.parceiro.nome, name: 'Parceiro', minWidth: '280px', maxWidth: '280px'},
    { selector: (row) => dayjs(row.emissao).format('DD/MM/YYYY'), name: 'Emissão', minWidth: '120px', maxWidth: '120px'},
    { selector: (row) => dayjs(row.dtmov).format('DD/MM/YYYY'), name: 'Entrada', minWidth: '120px', maxWidth: '120px'},
    { selector: (row) => row.numdoc, name: 'Num.docto', minWidth: '120px', maxWidth: '120px'},
    { selector: (row) => new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(row.total), name: 'Valor', minWidth: '120px', maxWidth: '120px', right: true},
    { selector: (row) => row.obs, name: 'Obs.', minWidth: '300px', maxWidth: '300px'},
  ]

  render = () => {

    return (
      <>

        <ViewEntradaSaida ref={this.ViewEntradaSaida} />

        <PageContent>
          
          <Stack spacing={'6px'} direction={'row'} alignItems={'flex-start'} justifyContent={'space-between'}>
            
            <HStack>

              <CustomSearch loading={this.state?.loading} fields={fields} defaultPicker={'descricao'} value={this.state?.request?.search} onChange={(search) => this.setState({request: {search}}, () => this.onSearch())} />
      
            </HStack>

          </Stack>

          <hr></hr>
          
          <Nav appearance="subtle">
            <Nav.Item active={!this.state?.request?.bankAccount} onClick={() => this.setState({request: {...this.state.request, bankAccount: undefined}}, () => this.onSearch())}><center style={{width: 140}}>Todos<br></br>{this.state?.loading ? "-" : <>{this.state?.response?.count}</>}</center></Nav.Item>
            {_.map(this.state?.response?.bankAccounts, (bankAccount) => {
              return <Nav.Item eventKey="home" active={this.state?.request?.bankAccount?.id == bankAccount.id} onClick={() => this.setState({request: {...this.state.request, bankAccount: bankAccount}}, () => this.onSearch())}><center style={{width: 160}}>{<><img src={bankAccount?.bank?.image} style={{height: '16px'}} />&nbsp;&nbsp;{bankAccount.name || <>{bankAccount?.agency}-{bankAccount?.agencyDigit} / {bankAccount?.account}-{bankAccount?.accountDigit}</>}</>}<br></br>{this.state?.loading ? '-' : <>R$ {bankAccount.balance}</>}</center></Nav.Item>
            })}
          </Nav>

          <DataTable columns={this.columns} rows={this.state?.response?.rows} loading={this.state?.loading} onItem={(row) => this.onEditarEntradaSaida(row.transacao)} selectedRows={true} onSelected={(selecteds) => this.setState({selecteds})} />
      
          <hr></hr>
          
          <Stack direction='row' alignItems='flexStart' justifyContent='space-between'>
          
            <div>
              <Button appearance='primary' color='blue' startIcon={<FaUpload />} onClick={this.onNovaEntradaSaida}>&nbsp;Novo</Button>
              <Button appearance='primary' color='blue' startIcon={<FaUpload />} disabled={_.size(this.state?.selecteds) != 1} style={{marginLeft: '10px'}} onClick={() => this.onEditarEntradaSaida(this.state?.selecteds[0]?.transacao)}>&nbsp;Editar</Button>
              <Button appearance='primary' color='blue' startIcon={<FaUpload />} disabled={_.size(this.state?.selecteds) == 0} style={{marginLeft: '10px'}}>&nbsp;Excluir {_.size(this.state?.selecteds)} registro(s)</Button>
            </div>
            
            <CustomPagination isLoading={this.state?.loading} total={this.state?.response?.count} limit={this.state?.request?.limit} activePage={this.state?.request?.offset + 1}
              onChangePage={(offset) => this.setState({request: {...this.state.request, offset: offset - 1}}, () => this.onSearch())}
              onChangeLimit={(limit) => this.setState({request: {...this.state.request, limit}}, () => this.onSearch())}
            />

          </Stack>
          
        </PageContent>
      </>
    )
  }
}

class Page extends React.Component {

  render = () => {
    return (
      <Panel header={<CustomBreadcrumb menu={'Movimentação'} title={'Entrada/Saída'} />}>
        <EntradaSaida />
      </Panel>
    )
  }

}

export default Page;