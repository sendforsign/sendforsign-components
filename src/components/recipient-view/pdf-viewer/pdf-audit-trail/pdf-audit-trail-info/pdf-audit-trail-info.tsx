import React, { Fragment } from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { Contract } from '../../../../../config/types'; 
type Props = {
	contract: Contract;
};
export const PdfAuditTrailInfo = ({ contract }: Props) => {
	dayjs.extend(utc);

	// Create styles
	const styles = StyleSheet.create({
		invoiceIdContainer: {
			flexDirection: 'row',
			marginTop: 20,
			marginLeft: 20,
			justifyContent: 'flex-start',
		},
		invoiceNameContainer: {
			flexDirection: 'row',
			marginTop: 10,
			marginLeft: 20,
			justifyContent: 'flex-start',
		},
		invoiceText: {
			fontSize: '14px',
			fontWeight: 'bold',
		},
		label: {
			fontSize: '14px',
			width: 160,
		},
	});

	return (
		<Fragment>
			<View style={styles.invoiceIdContainer}>
				<Text style={styles.label}>Document ID:</Text>
				<Text style={styles.invoiceText}>{contract.controlLink}</Text>
			</View>
			<View style={styles.invoiceNameContainer}>
				<Text style={styles.label}>Document name: </Text>
				<Text style={styles.invoiceText}>{contract.contractName}</Text>
			</View>
		</Fragment>
	);
};
