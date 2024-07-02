import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { pdfjs } from 'react-pdf';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { Contract, Row } from '../../../config/types';
import { PdfAuditTrailInfo } from './pdf-audit-trail-info/pdf-audit-trail-info';
import { PdfAuditTrailTable } from './pdf-audit-trail-table/pdf-audit-trail-table';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
type Props = {
	rows: Row[];
	contract: Contract;
};
export const PdfAuditTrail = ({ rows, contract }: Props) => {
	dayjs.extend(utc);

	// Create styles
	const styles = StyleSheet.create({
		page: {
			flexDirection: 'column',
		},
		section: {
			margin: 20,
			padding: 20,
			fontSize: '12px',
			lineHeight: '2px',
		},
		header: {
			fontSize: 18,
			fontWeight: 600,
			textAlign: 'center',
		},
	});

	return (
		<Document>
			<Page size='A3' style={styles.page}>
				<View style={styles.section}>
					<Text style={styles.header}>Signature Certificate</Text>
				</View>
				<PdfAuditTrailInfo contract={contract} />
				<PdfAuditTrailTable rows={rows} />
			</Page>
		</Document>
	);
};
