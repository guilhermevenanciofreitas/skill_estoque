import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import { Stack } from 'rsuite';

const Brand = props => {

  const Authorization = JSON.parse(localStorage.getItem("Authorization"))

  return (
    <Stack className="brand" {...props}>
      <Logo height={26} style={{ marginTop: 6 }} />
      <Link to="/">
        <span style={{ marginLeft: 14 }}>{Authorization?.companyId == 1 ? 'GASTROBAR' : Authorization?.companyId == 1 ? 'LANCH-2' : 'LANCH-3'}</span>
      </Link>
    </Stack>
  );
};

export default Brand