import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import { Stack } from 'rsuite';

const Brand = props => {

  const Authorization = JSON.parse(localStorage.getItem("Authorization"))

  return (
    <Stack className="brand" {...props}>
      <Link to="/">
        <span style={{ marginTop: '100px', fontSize: 14 }}>{Authorization?.companyId == 1 ? 'GASTROBAR' : Authorization?.companyId == 2 ? 'RESTAURANTE GUARANY' : 'RESTAURANTE 242'}</span>
      </Link>
    </Stack>
  );
};

export default Brand