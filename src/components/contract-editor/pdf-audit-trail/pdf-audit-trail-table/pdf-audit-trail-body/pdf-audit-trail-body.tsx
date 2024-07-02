import React from 'react';
import { Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { Row } from '../../../../../config/types';

type Props = {
	rows: Row[];
};
export const PdfAuditTrailBody = ({ rows }: Props) => {
	// Create styles
	const styles = StyleSheet.create({
		row: {
			flexDirection: 'row',
			borderBottomColor: '#bff0fd',
			borderBottomWidth: 1,
			alignItems: 'center',
			height: 100,
			fontStyle: 'bold',
			marginLeft: 20,
			marginRight: 20,
			fontSize: 12,
		},
		signedBy: {
			width: '25%',
			textAlign: 'left',
			borderRightColor: '#ffffff',
			borderRightWidth: 1,
			paddingRight: 8,
		},
		when: {
			width: '20%',
			borderRightColor: '#ffffff',
			borderRightWidth: 1,
			textAlign: 'left',
			paddingRight: 8,
		},
		where: {
			width: '20%',
			borderRightColor: '#ffffff',
			borderRightWidth: 1,
			textAlign: 'left',
			paddingRight: 8,
		},
		signature: {
			width: '30%',
			textAlign: 'right',
		},
		image: {
			width: 200,
		},
	});

	return (
		<View>
			{rows &&
				rows.length > 0 &&
				rows.map((row) => {
					return (
						<View style={styles.row}>
							<View style={styles.signedBy}>
								<View>
									<Text>{row.name}</Text>
								</View>
								<View>
									<Text>{row.email}</Text>
								</View>
							</View>
							<View style={styles.when}>
								<Text>{row.createTime}</Text>
							</View>
							<View style={styles.where}>
								<View>
									<Text>IP:</Text>
									<Text> {row.json?.ip}</Text>
								</View>
								<View>
									<Text>Location:</Text>
									<Text>{`${row.json.city}, ${row.json.country_name}`}</Text>
								</View>
								<View>
									<Text>Timezone:</Text>
									<Text>{`${row.json.timezone}, ${row.json.utc_offset}`}</Text>
								</View>
							</View>
							<View style={styles.signature}>
								<Image style={styles.image} source={row.base64} />
							</View>
						</View>
					);
				})}
		</View>
	);
};
