import React from 'react';
import ReactPDF, {
	Document,
	Page,
	Text,
	View,
	StyleSheet,
	Image,
} from '@react-pdf/renderer';
import { pdfjs } from 'react-pdf';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { ContractSign } from '../../../config/types';
import { useContractEditorContext } from '../contract-editor-context';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
// interface Props extends ReactPDF.DocumentProps {
// 	signs: ContractSign[];
// }
export const PdfSign = ({
	...other
}: ReactPDF.DocumentProps): React.ReactElement => {
	const { signs } = useContractEditorContext();
	dayjs.extend(utc);
	// const ref = useRef();

	// useEffect(() => {
	// 	if (ref) {
	// 		//console.log(ref);
	// 	}
	// }, [ref]);

	// if (signs && signs.length === 0) {
	// 	return <></>;
	// }

	// Create styles
	const styles = StyleSheet.create({
		page: {},
		section: {
			margin: 20,
			padding: 20,
			fontSize: '12px',
			lineHeight: '2px',
		},
		image: {
			marginTop: 10,
			marginBottom: 10,
			width: 300,
			border: '1px solid #eeeeee',
			borderRadius: 8,
		},
		header: {
			fontSize: '18px',
			fontWeight: 600,
			textAlign: 'center',
		},
	});

	return (
		<Document>
			<Page size='A3' style={styles.page}>
				<View style={styles.section}>
					<Text style={styles.header}>Signature page follows</Text>
				</View>

				{signs &&
					signs.length > 0 &&
					signs
						.filter((contractSignData) => contractSignData.base64 !== null)
						.map((contractSignData) => {
							return (
								<>
									<View style={styles.section}>
										<Image
											style={styles.image}
											source={contractSignData.base64}
										/>
										<Text>Name: {contractSignData.fullName}</Text>
										<Text>Email: {contractSignData.email}</Text>
										<Text>
											Timestamp:{' '}
											{dayjs(contractSignData.createTime).format(
												'YYYY-MM-DD HH:mm:ss'
											)}{' '}
											GMT
										</Text>
									</View>
								</>
							);
						})}
			</Page>
		</Document>
	);
};
