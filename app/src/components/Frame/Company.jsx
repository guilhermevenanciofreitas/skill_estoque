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
      <div style={{float: 'right', padding: '20px', cursor: 'pointer'}} onClick={() => {
        localStorage.removeItem("Authorization")
      }}>
        SAIR
      </div>
     
    </Navbar>
  );
};

export default Company;
