import React from 'react';
import { Navbar, Nav } from 'rsuite';
import ArrowLeftLineIcon from '@rsuite/icons/ArrowLeftLine';
import ArrowRightLineIcon from '@rsuite/icons/ArrowRightLine';
import Brand from '../Brand';

const Company = () => {
  return (
    <Navbar appearance="subtle" className="nav-toggle">
      
      <div style={{float: 'left'}}>
      <Brand />
      </div>
      <div style={{float: 'right', padding: '12px', cursor: 'pointer', fontSize: 14}} onClick={() => {
        localStorage.removeItem("Authorization")
      }}>
        SAIR
      </div>
     
    </Navbar>
  );
};

export default Company;
