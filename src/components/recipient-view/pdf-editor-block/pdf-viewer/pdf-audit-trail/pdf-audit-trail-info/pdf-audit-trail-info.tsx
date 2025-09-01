import React, { Fragment } from "react";
import { Text, View, StyleSheet } from "@react-pdf/renderer";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { Contract } from "../../../../../../config/types";
type Props = {
  contract: Contract;
};
export const PdfAuditTrailInfo = ({ contract }: Props) => {
  dayjs.extend(utc);

  // Create styles
  const styles = StyleSheet.create({
    container: {
      backgroundColor: "#f9f9f9",
      padding: 16,
      margin: 18,
    },
    row: {
      flexDirection: "row",
      borderBottomColor: "#e0e0e0",
      borderBottomWidth: 1,
      alignItems: "center",
      fontSize: 12,
      lineHeight: "1.6px",
      paddingVertical: 10,
    },
    signedBy: {
      width: "50%",
      textAlign: "left",
      paddingRight: 8,
      paddingLeft: 8,
    },
    when: {
      width: "50%",
      textAlign: "left",
      paddingRight: 8,
      paddingLeft: 8,
    },
    invoiceText: {
      fontSize: "14px",
      fontWeight: "bold",
    },
    label: {
      fontSize: "12px",
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.signedBy}>
          <Text style={styles.label}>Document ID:</Text>
          <Text style={styles.invoiceText}>{contract.controlLink}</Text>
        </View>
        <View style={styles.when}>
          <Text style={styles.label}>Document name:</Text>
          <Text style={styles.invoiceText}>{contract.contractName}</Text>
        </View>
      </View>
    </View>
  );
};
