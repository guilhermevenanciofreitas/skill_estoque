import React, { useState } from 'react';
import { View, Text, Button, Platform, TextInput } from 'react-native';
import DateTimePicker from './DateTime';

const DateRangePicker = ({startDate = new Date(), endDate = new Date(), onChange}) => {
  //const [startDate, setStartDate] = useState(new Date());
  //const [endDate, setEndDate] = useState(new Date());

  return (
    <View style={{ padding: 20 }}>
        <>
          <DateTimePicker value={startDate} onChange={(event) => onChange(event.target.value, endDate)} />
          <DateTimePicker value={endDate} onChange={(event) => onChange(startDate, event.target.value)} />
        </>
    </View>
  );
};

export default DateRangePicker;