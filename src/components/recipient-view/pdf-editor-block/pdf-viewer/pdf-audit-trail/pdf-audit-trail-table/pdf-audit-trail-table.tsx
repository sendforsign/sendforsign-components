import React from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { View, StyleSheet } from "@react-pdf/renderer";
import { PdfAuditTrailHeader } from "./pdf-audit-trail-header/pdf-audit-trail-header";
import { PdfAuditTrailBody } from "./pdf-audit-trail-body/pdf-audit-trail-body";
import { Row } from "../../../../../../config/types";
type Props = {
  rows: Row[];
};
export const PdfAuditTrailTable = ({ rows }: Props) => {
  dayjs.extend(utc);

  // Create styles
  const styles = StyleSheet.create({
    tableContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginTop: 24,
      marginLeft: 20,
      marginRight: 20,
      borderWidth: 1,
      borderColor: "#f6f6f6",
    },
  });

  return (
    <View style={styles.tableContainer}>
      <PdfAuditTrailHeader />
      <PdfAuditTrailBody rows={rows} />
    </View>
  );
};
