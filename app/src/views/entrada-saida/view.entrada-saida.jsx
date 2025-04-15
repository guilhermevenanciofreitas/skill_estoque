import React from "react";
import { Button, Divider, Form, Loader, Message, Modal, toaster } from 'rsuite';
import { Container, Row, Col } from 'react-grid-system';
import { AutoComplete, DataTable, ViewModal } from "../../controls";
import { MdAddCircleOutline, MdCheckCircleOutline, MdDelete, MdEdit } from "react-icons/md";
import { Service } from "../../service";
import { Loading } from "../../App";

import _ from "lodash";
import { Search } from "../../search";

import dayjs from 'dayjs'
import { Decimal } from "../../utils/decimal";
import { Exception } from "../../utils/exception";
import { FaApper, FaClone, FaEdit, FaNewspaper, FaPager, FaPlusCircle, FaSave, FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";

class ViewEntradaSaida extends React.Component {

    viewModal = React.createRef()

    state = {
        orig: {
            codloc: 0
        },
        dest: {
            codloc: 0
        }
    }

    novaEntradaSaida = async (entradaSaida) => {

        if (this.state) for (const prop of Object.getOwnPropertyNames(this.state)) delete this.state[prop]
        this.setState({...entradaSaida})

        await new Service().Post('entrada-saida/locais').then((result) => this.setState({locais: result.data}))

        return this.viewModal.current.show()

    }

    editarEntradaSaida = async (transacao) => {

        if (this.state) for (const prop of Object.getOwnPropertyNames(this.state)) delete this.state[prop]

        Loading.Show();

        await new Service().Post('entrada-saida/locais').then((result) => this.setState({locais: result.data}))

        await new Service().Post('entrada-saida/editar', {transacao}).then(async (result) => {

            result.data.items?.forEach((item, index) => item.index = index + 1)

            this.setState({...result.data})

            if (result.data.tipoEntSai) {
                await this.onTipoOperacao(result.data.tipoEntSai?.tipo)
                this.setState({tipoEntSai: result.data.tipoEntSai})
            }
        }).finally(() => Loading.Hide())

        return this.viewModal.current.show()
    }

    salvarEntradaSaida = async () => {
        try {

            this.setState({submting: true})

            const movCab = _.pick(this.state, [
                'transacao',
                'parceiro.codparc',
                'tipoEntSai.codentsai',
                'emissao',
                'dtmov',
                'numdoc',
                'obs'
            ])

            movCab.total = _.sumBy(this.state?.items, (item) => item.qtde * item.punit)

            let movItems = []

            for (const item of this.state.items) {
                movItems.push(_.pick(item, [
                    'id',
                    'produto.codprod',
                    'qtde',
                    'punit',
                    'orig.codloc',
                    'dest.codloc',
                ]))
            }

            movCab.items = movItems

            const errors = []
            
            //if (_.isEmpty(produto.unidade)) {
            //    errors.push('Informe a unidade!')
            //}

            if (_.size(errors)) {
                await toaster.push(<Message showIcon type='warning'><ul>{errors.map((c) => <li>{c}</li>)}</ul></Message>, {placement: 'topEnd', duration: 5000 })
                return
            }

            const result = await new Service().Post('entrada-saida/salvar', movCab)
            await toaster.push(<Message showIcon type='success'>Salvo com sucesso!</Message>, {placement: 'topEnd', duration: 5000 })
            this.viewModal.current?.close(result.data)
           
        } catch (error) {
            Exception.error(error)
        } finally {
            this.setState({submting: false})
        }
    }
    
    onSalvarItem = () => {

        if (parseFloat(this.state?.qtde || 0) == 0) {
            Swal.fire({title: '', text: 'Informe a quantidade!', icon: 'warning', confirmButtonText: 'OK'})
            return
        }

        if (this.state?.tipoEntSai?.tipo == 'S') {

            if (parseInt(this.state?.orig?.codloc || 0) == 0) {
                Swal.fire({title: '', text: 'Para SAÍDA deve ser informado a ORIGEM!', icon: 'warning', confirmButtonText: 'OK'})
                return
            }

            if (parseInt(this.state?.dest?.codloc || 0) != 0) {
                Swal.fire({title: '', text: 'Para SAÍDA deve ser informado apenas a ORIGEM!', icon: 'warning', confirmButtonText: 'OK'})
                return
            }

        }

        if (this.state?.tipoEntSai?.tipo == 'E') {

            if (parseInt(this.state?.dest?.codloc || 0) == 0) {
                Swal.fire({title: '', text: 'Para ENTRADA deve ser informado o DESTINO!', icon: 'warning', confirmButtonText: 'OK'})
                return
            }

            if (parseInt(this.state?.orig?.codloc || 0) != 0) {
                Swal.fire({title: '', text: 'Para ENTRADA deve ser informado apenas o DESTINO!', icon: 'warning', confirmButtonText: 'OK'})
                return
            }

        }

        let items = this.state?.items || []

        
        const item = {
            id: this.state.id,
            produto: this.state.produto,
            qtde: this.state.qtde ?? 0,
            punit: this.state.punit ?? 0,
            orig: this.state?.orig == 0 ? {codloc: 0} : this.state?.orig,
            dest: this.state?.dest == 0 ? {codloc: 0} : this.state?.dest,
        }

        if (!this.state?.index)
        {
            items.push(item)

        } else {

            const index = items.findIndex((item) => item.index == this.state.index)

            items[index] = item

        }

        let i = 1
        _.map(items, (c) => {
            c.index = i
            i++
        })

        this.setState({items})
        this.onLimparItem()
        
    }

    onLimparItem = () => {
        this.setState({
            index: undefined,
            id: undefined,
            produto: undefined,
            qtde: 0,
            punit: 0,
            orig: {codloc: 0},
            dest: {codloc: 0},
        })
    }

    onEditarItem = (index) => {

        const item = this.state?.items.filter((item) => item.index == index)

        const i = {...item[0]}

        this.setState(i)

    }

    onDeleteItem = async (index) => {

        const r = await Swal.fire({title: 'Tem certeza que deseja excluir ?', icon: 'warning', showCancelButton: true, confirmButtonText: 'Sim', cancelButtonText: 'Não'})
        if (!r.isConfirmed) return

        const items = this.state?.items.filter(item => item.index !== index)

        this.setState({items})

        await toaster.push(<Message showIcon type='success'>Excluido com sucesso!</Message>, {placement: 'topEnd', duration: 5000 })

    }

    onTipoOperacao = async (tipo) => {
        Loading.Show('Carregando operações...')
        this.setState({tipoEntSai: {tipo}})
        await new Service().Post('entrada-saida/tipo-operacoes', {tipo}).then((result) => this.setState({tipoOperacoes: result.data})).finally(() => Loading.Hide())
    }

    close(role) {
        this.viewModal.current?.close(role)
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
            <Form autoComplete='off' onSubmit={this.submit}>
                <ViewModal ref={this.viewModal} size={900}>
                    <Modal.Header><Modal.Title><Container>Entrada/Saída</Container></Modal.Title></Modal.Header>
                    <Modal.Body>
                        <Row gutterWidth={0}>
                            <Col md={4}>
                                <div className='form-control'>
                                    <label class="textfield-filled">
                                        <input type='text' value={this.state?.transacao} readOnly />
                                        <span>N.Transação</span>
                                    </label>
                                </div>
                            </Col>
                            <Col md={4}>
                                <div className='form-control'>
                                    <label class="textfield-filled">
                                        <input type='text' value={dayjs(this.state?.inclusao).format('DD/MM/YYYY HH:mm')} readOnly />
                                        <span>Dt.inclusão</span>
                                    </label>
                                </div>
                            </Col>
                            <Col md={4}>
                                <div className='form-control'>
                                    <label class="textfield-filled">
                                        <input type='text' value={this.state?.alteracao ? dayjs(this.state?.alteracao).format('DD/MM/YYYY HH:mm') : ''} readOnly />
                                        <span>Ult. alteração</span>
                                    </label>
                                </div>
                            </Col>
                            <Col md={3}>
                                <div className='form-control'>
                                    <label className="textfield-filled">
                                        <select value={this.state?.tipoEntSai?.tipo} onChange={(event) => this.onTipoOperacao(event.target.value)} >
                                            <option value="">[Selecione]</option>
                                            <option value="E">Entrada</option>
                                            <option value="S">Saída</option>
                                            <option value="A">Transferência</option>
                                        </select>
                                        <span>Tipo operação</span>
                                    </label>
                                </div>
                            </Col>
                            <Col md={9}>
                                <div className='form-control'>
                                    <label className="textfield-filled">
                                        <select value={this.state?.tipoEntSai?.codentsai} onChange={(event) => this.setState({tipoEntSai: {codentsai: event.target.value}})} >
                                            <option value="">[Selecione]</option>
                                            {_.map(this.state?.tipoOperacoes, (c) => <option value={c.codentsai}>{c.descricao}</option>)}
                                        </select>
                                        <span>Descrição</span>
                                    </label>
                                </div>
                            </Col>
                            <Col md={12}>
                                <div className='form-control'>
                                    <AutoComplete label='Parceiro' value={this.state?.parceiro} text={(item) => `${item.codparc} - ${item.nome}`} onChange={(parceiro) => this.setState({parceiro})} onSearch={async (search) => await Search.parceiro(search, this.state?.tipoEntSai?.tipo)}>
                                        <AutoComplete.Result>
                                            {(item) => <span>{item.codparc} - {item.nome}</span>}
                                        </AutoComplete.Result>
                                    </AutoComplete>
                                </div>
                            </Col>
                            <Col md={4}>
                                <div className='form-control'>
                                    <label class="textfield-filled">
                                        <input type='date' value={this.state?.emissao} onChange={(event) => this.setState({emissao: event.target.value})} />
                                        <span>Dt.emissão</span>
                                    </label>
                                </div>
                            </Col>
                            <Col md={4}>
                                <div className='form-control'>
                                    <label class="textfield-filled">
                                        <input type='date' value={this.state?.dtmov} onChange={(event) => this.setState({dtmov: event.target.value})} />
                                        <span>Dt.Ent/Saí</span>
                                    </label>
                                </div>
                            </Col>
                            <Col md={4}>
                                <div className='form-control'>
                                    <label class="textfield-filled">
                                        <input type='text' value={this.state?.numdoc} onChange={(event) => this.setState({numdoc: event.target.value})}  />
                                        <span>Nº Doc</span>
                                    </label>
                                </div>
                            </Col>
                            <Col md={3}>
                                <div className='form-control'>
                                    <label className="textfield-filled">
                                        <input
                                        type="text"
                                        value={Decimal.format(_.sumBy(this.state?.items, (item) => item.qtde * item.punit))}
                                        //onFocus={(event) => event.target.select()}
                                        //onChange={(event) => this.setState({total: Decimal.change(event.target.value)})}
                                        readOnly
                                        style={{textAlign: 'right'}}
                                        />
                                        <span>Valor total</span>
                                    </label>
                                </div>
                            </Col>
                            <Col md={9}>
                                <div className='form-control'>
                                    <label class="textfield-filled">
                                        <input type='text' value={this.state?.obs} onChange={(event) => this.setState({obs: event.target.value.toUpperCase()})} />
                                        <span>Observação</span>
                                    </label>
                                </div>
                            </Col>

                            <Divider />

                            <Col md={6}>
                                <div className='form-control'>
                                    <AutoComplete label='Produto' value={this.state?.produto} text={(item) => `${item.codprod} - ${item.descricao}`} onChange={(produto) => this.setState({produto, punit: produto?.custo ?? 0})} onSearch={async (search) => await Search.produto(search)}>
                                        <AutoComplete.Result>
                                            {(item) => <span>{item.codprod} - {item.descricao}</span>}
                                        </AutoComplete.Result>
                                    </AutoComplete>
                                </div>
                            </Col>
                            <Col md={6}>
                                <Row gutterWidth={0}>
                                    <Col md={4}>
                                        <div className='form-control'>
                                            <label className="textfield-filled">
                                                <input
                                                type="text"
                                                value={Decimal.format(this.state?.qtde)}
                                                onFocus={(event) => event.target.select()}
                                                onChange={(event) => this.setState({qtde: Decimal.change(event.target.value)})}
                                                style={{textAlign: 'right'}}
                                                />
                                                <span>Quantidade</span>
                                            </label>
                                        </div>
                                    </Col>
                                    <Col md={4}>
                                        <div className='form-control'>
                                            <label className="textfield-filled">
                                                <input
                                                type="text"
                                                value={Decimal.format(this.state?.punit)}
                                                onFocus={(event) => event.target.select()}
                                                onChange={(event) => this.setState({punit: Decimal.change(event.target.value)})}
                                                style={{textAlign: 'right'}}
                                                />
                                                <span>Preço Un.</span>
                                            </label>
                                        </div>
                                    </Col>
                                    <Col md={4}>
                                        <div className='form-control'>
                                            <label className="textfield-filled">
                                                <input
                                                type="text"
                                                value={Decimal.format(parseFloat(this.state?.qtde ?? 0) * parseFloat(this.state?.punit ?? 0))}
                                                readOnly
                                                style={{textAlign: 'right'}}
                                                />
                                                <span>Total</span>
                                            </label>
                                        </div>
                                    </Col>
                                </Row>
                            </Col>
                            
                            <Col md={12}>
                                <Row gutterWidth={0}>
                                    <Col md={9}>
                                        <Row gutterWidth={0}>
                                            <Col>
                                                <div className='form-control'>
                                                    <label className="textfield-filled">
                                                        <select value={this.state?.orig?.codloc} onChange={() => this.setState({orig: {codloc: event.target.value, descricao: event.target.options[event.target.selectedIndex].text}})} >
                                                            <option value={0}>[Selecione]</option>
                                                            {_.map(this.state?.locais, (c) => <option value={c.codloc}>{c.descricao}</option>)}
                                                        </select>
                                                        <span>Origem</span>
                                                    </label>
                                                </div>
                                            </Col>
                                            <Col>
                                                <div className='form-control'>
                                                    <label className="textfield-filled">
                                                        <select value={this.state?.dest?.codloc} onChange={() => this.setState({dest: {codloc: event.target.value, descricao: event.target.options[event.target.selectedIndex].text}})} >
                                                            <option value={0}>[Selecione]</option>
                                                            {_.map(this.state?.locais, (c) => <option value={c.codloc}>{c.descricao}</option>)}
                                                        </select>
                                                        <span>Destino</span>
                                                    </label>
                                                </div>
                                            </Col>
                                        </Row>
                                    </Col> 
                                    <Col md={3} style={{textAlign: 'right'}}>
                                        <Button style={{margin: '4px'}} appearance="primary" color='blue' onClick={this.onLimparItem}><FaClone /> &nbsp;<font size='2'>Limpar</font></Button>
                                        <Button style={{margin: '4px'}} appearance="primary" color='blue' onClick={this.onSalvarItem}><FaSave /> &nbsp;<font size='2'>Salvar</font></Button>
                                    </Col>

                                </Row>
                            </Col>

                            <Col md={12}>
                                <div style={{maxHeight: '250px', overflow: 'auto'}}>
                                    <table>
                                        <thead>
                                        <tr>
                                            <th>Código</th>
                                            <th>Descrição</th>
                                            <th>Unid.</th>
                                            <th>Qtde</th>
                                            <th>Preço Un.</th>
                                            <th>Total</th>
                                            <th>Origem</th>
                                            <th>Destino</th>
                                            <th></th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                            {_.map(_.sortBy(this.state?.items, ['produto.descricao']), (item) =>
                                                <tr className="rdt_TableRow">
                                                    <td style={{textAlign: 'center'}}>{item.produto?.codprod}</td>
                                                    <td>{item.produto?.descricao}</td>
                                                    <td style={{textAlign: 'center'}}>{item.produto?.unidade}</td>
                                                    <td style={{textAlign: 'right'}}>{Decimal.format(item.qtde)}</td>
                                                    <td style={{textAlign: 'right'}}>{Decimal.format(item.punit)}</td>
                                                    <td style={{textAlign: 'right'}}>{Decimal.format(item.qtde * item.punit)}</td>
                                                    <td>{item.orig?.descricao}</td>
                                                    <td>{item.dest?.descricao}</td>
                                                    <td style={{textAlign: 'center'}}>
                                                        <FaEdit size='18px' color='orange' style={{cursor: 'pointer'}} onClick={() => this.onEditarItem(item.index)} />
                                                        <FaTrash size='18px' color='tomato' style={{cursor: 'pointer'}} onClick={() => this.onDeleteItem(item.index)} />
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </Col>
                        </Row>
                        
                    </Modal.Body>
                    <Modal.Footer>
                        <Button appearance="primary" color='green' onClick={this.salvarEntradaSaida} disabled={this.state?.submting}>{this.state?.submting ? <><Loader /> &nbsp; Salvando...</> : <><MdCheckCircleOutline /> &nbsp; Salvar</>}</Button>
                    </Modal.Footer>
                </ViewModal>
            </Form>
        )

    }

}

export default ViewEntradaSaida;