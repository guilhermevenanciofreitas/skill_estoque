import React from 'react'
import { Modal } from 'rsuite'
import { ViewModal } from '../../controls'

import { Worker, Viewer, DefaultLayout } from '@react-pdf-viewer/core'
import '@react-pdf-viewer/core/lib/styles/index.css'
import '@react-pdf-viewer/default-layout/lib/styles/index.css'

import { Zoom, Print, PageNavigation } from '@react-pdf-viewer/zoom'
import '@react-pdf-viewer/zoom/lib/styles/index.css'
import '@react-pdf-viewer/print/lib/styles/index.css'
import '@react-pdf-viewer/page-navigation/lib/styles/index.css'

const PdfViewer = ({ base64Pdf }) => {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Worker workerUrl={`https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js`}>
        {/* Usando DefaultLayout que inclui os controles padrão */}
        <Viewer fileUrl={base64Pdf} />
      </Worker>
    </div>
  )
}

export class ReportViewer extends React.Component {
  viewModal = React.createRef()

  visualize = (pdf) => {
    this.setState({ pdf })
    return this.viewModal.current.show()
  }

  close() {
    this.viewModal.current?.close()
  }

  render() {
    return (
      <ViewModal ref={this.viewModal} size={900}>
        <Modal.Body>
          <div style={{ width: 'auto', height: 'auto', overflow: 'auto' }}>
            <PdfViewer base64Pdf={`data:application/pdf;base64,${this.state?.pdf}`} />
          </div>
        </Modal.Body>
      </ViewModal>
    )
  }
}
