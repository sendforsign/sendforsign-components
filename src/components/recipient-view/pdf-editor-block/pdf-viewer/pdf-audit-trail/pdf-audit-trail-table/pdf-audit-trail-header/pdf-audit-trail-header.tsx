import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

export const PdfAuditTrailHeader = () => {
  dayjs.extend(utc);

  // Create styles
  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      borderBottomColor: '#f6f6f6',
      backgroundColor: '#f6f6f6',
      borderBottomWidth: 1,
      alignItems: 'center',
      height: 24,
      textAlign: 'left',
      fontWeight: 'bold',
      fontSize: 10,
      paddingLeft: 8,
      flexGrow: 1,
    },
    signedBy: {
      width: '33%',
      paddingLeft: 16,
    },
    when: {
      width: '12%',
    },
    where: {
      width: '30%',
    },
    signature: { width: '25%' },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.signedBy}>Signed by</Text>
      <Text style={styles.when}>When</Text>
      <Text style={styles.where}>Where</Text>
      <Text style={styles.signature}>Signature</Text>
    </View>
  );
};
