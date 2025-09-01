import React from 'react';
import { Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { Row } from '../../../../../../../config/types';

type Props = {
	rows: Row[];
};
export const PdfAuditTrailBody = ({ rows }: Props) => {
	// Create styles
	const styles = StyleSheet.create({
		container: {
		  backgroundColor: '#f9f9f9',
		  padding: 16,
		},
		row: {
		  flexDirection: 'row',
		  borderBottomColor: '#e0e0e0',
		  borderBottomWidth: 1,
		  alignItems: 'center',
		  fontSize: 12,
		  lineHeight: '1.6px',
		  paddingVertical: 10,
		},
		signedBy: {
		  width: '33%',
		  textAlign: 'left',
		  borderRightColor: '#f9f9f9',
		  borderRightWidth: 1,
		  paddingRight: 8,
		  paddingLeft: 8,
		},
		when: {
		  width: '12%',
		  borderRightColor: '#f9f9f9',
		  borderRightWidth: 1,
		  textAlign: 'left',
		  paddingRight: 16,
		},
		where: {
		  width: '30%',
		  borderRightColor: '#f9f9f9',
		  borderRightWidth: 1,
		  textAlign: 'left',
		  paddingRight: 8,
		},
		signature: {
		  width: '25%',
		  textAlign: 'right',
		},
		image: {
		  width: 200,
		  padding: 8,
		},
	  });

	return (
		<View style={styles.container}>
      {rows &&
        rows.length > 0 &&
        rows.map((row) => {
          return (
            <View style={styles.row}>
              <View style={styles.signedBy}>
                <View>
                  <Text style={{ fontWeight: 'bold' }}>{row.name}</Text>
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
                  <Text>IP:{' '}{row.json ? row.json?.ip : 'Not collected'}</Text>
                </View>
                <View>
                  <Text>
                    Location:{' '}
                    {row.json
                      ? `${row.json?.city}, ${row.json?.country_name}`
                      : 'Not collected'}
                  </Text>
                </View>
                <View>
                  <Text>
                    Timezone:{' '}
                    {row.json
                      ? `${row.json?.timezone}, ${row.json?.utc_offset}`
                      : 'Not collected'}
                  </Text>
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
