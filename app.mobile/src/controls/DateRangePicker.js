import React, { useState } from 'react';
import { View, Text, Button, Platform, TextInput, StyleSheet } from 'react-native';
import DateTimePicker from './DateTime';
import dayjs from 'dayjs'

const DateRangePicker = ({startDate = undefined, endDate = undefined, onChange}) => {

  return (
    <View style={{ padding: 20 }}>
        <>
          <Text style={styles.text}>Data inicial</Text>
          <DateTimePicker value={startDate} onChange={(event) => onChange(event.target.value, endDate)} />
          <Text style={styles.text}>Data final</Text>
          <DateTimePicker value={endDate} onChange={(event) => onChange(startDate, event.target.value)} />
        </>
    </View>
  );
};

const styles = StyleSheet.create({
  text: {
    fontWeight: 'bold',
  },
})

export default DateRangePicker;