import React from 'react'
import { Badge, Button, HStack, IconButton, List, Nav, Panel, Popover, Stack, Whisper } from 'rsuite'

import dayjs from 'dayjs'

import PageContent from '../../components/PageContent'

import { CustomBreadcrumb, CustomPagination, CustomSearch, DataTable } from '../../controls'
import { FaEdit, FaEllipsisV, FaFileDownload, FaPlusCircle, FaPrint, FaTrash, FaUpload } from 'react-icons/fa'
import { Service } from '../../service'

import ViewEntradaSaida from './view.entrada-saida'

import _ from 'lodash'
import { times } from 'lodash'
import { Exception } from '../../utils/exception'

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

  onSearch = async () => {
    this.setState({loading: true}, async () => {
      try {
        
        this.setState({loading: true})
        const result = await new Service().Post('entrada-saida/lista', this.state.request)
        this.setState({...result.data})
        
      } catch (error) {
        Exception.error(error)
      } finally {
        this.setState({loading: false})
      }
    })
  }

  onEditarEntradaSaida = async (unidade) => {
    try {

      const entSai = await this.ViewEntradaSaida.current.editarEntradaSaida(unidade)
      if (entSai) this.onSearch()

    } catch (error) {
      Exception.error(error)
    }
  }

  onNovaEntradaSaida = async () => {
    try {

      const entSai = await this.ViewEntradaSaida.current.novaEntradaSaida({tipo: 1})
      if (entSai) this.onSearch()

    } catch (error) {
      Exception.error(error)
    }
  }

  columns = [
    { selector: (row) => row.transacao, name: 'Cod. ID', minWidth: '60px', maxWidth: '60px'},
    { selector: (row) => row.tipoEntSai?.tipo, name: 'Tipo', minWidth: '40px', maxWidth: '40px'},
    { selector: (row) => row.tipoEntSai?.descricao, name: 'Descrição do tipo', minWidth: '220px', maxWidth: '220px'},
    //{ selector: (row) => `${row.tipoEntSai?.tipo} - ${row.tipoEntSai?.descricao}`, name: 'Tipo', maxWidth: '220px'},
    { selector: (row) => row.parceiro?.nome, name: 'Parceiro', minWidth: '220px', maxWidth: '220px'},
    { selector: (row) => row.emissao ? dayjs(row.emissao).format('DD/MM/YYYY') : '', name: 'Emissão', minWidth: '90px', maxWidth: '90px'},
    { selector: (row) => row.dtmov ? dayjs(row.dtmov).format('DD/MM/YYYY') : '', name: 'Entrada', minWidth: '90px', maxWidth: '90px'},
    { selector: (row) => row.numdoc, name: 'Num.docto', minWidth: '70px', maxWidth: '70px'},
    { selector: (row) => new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(row.total), name: 'Valor', maxWidth: '120px', right: true},
    { selector: (row) => row.obs, name: 'Obs.'},
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
            <Stack spacing={5}>
              <Button appearance='primary' color='blue' startIcon={<FaPlusCircle />} onClick={this.onNovaEntradaSaida}>&nbsp;Novo</Button>
              <Button appearance='primary' color='blue' startIcon={<FaEdit />} disabled={_.size(this.state?.selecteds) != 1} onClick={() => this.onEditarEntradaSaida(this.state?.selecteds[0]?.transacao)}>&nbsp;Editar</Button>
              <Button appearance='primary' color='blue' startIcon={<FaTrash />} disabled={_.size(this.state?.selecteds) == 0}>&nbsp;Excluir</Button>
            </Stack>
            <CustomPagination isLoading={this.state?.loading} total={this.state?.response?.count} limit={this.state?.request?.limit} activePage={this.state?.request?.offset + 1} onChangePage={(offset) => this.setState({request: {...this.state.request, offset: offset - 1}}, () => this.onSearch())} onChangeLimit={(limit) => this.setState({request: {...this.state.request, limit}}, () => this.onSearch())} />
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