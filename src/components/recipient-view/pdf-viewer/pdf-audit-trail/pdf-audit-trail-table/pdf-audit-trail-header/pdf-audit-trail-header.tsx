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
      borderBottomColor: '#bff0fd',
      backgroundColor: '#bff0fd',
      borderBottomWidth: 1,
      alignItems: 'center',
      height: 24,
      textAlign: 'center',
      fontWeight: 'bold',
      flexGrow: 1,
    },
    signedBy: {
      width: '25%',
    },
    when: {
      width: '20%',
    },
    where: {
      width: '20%',
    },
    signature: { width: '30%' },
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
