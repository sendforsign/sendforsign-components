import React, { forwardRef, FC, useRef, useState, useEffect } from 'react';

import { Space, Modal, Typography } from 'antd';
import { ModalViewProps } from './modal-view.types';
import { Editor } from '..';
import useSaveParams from '../../hooks/use-save-params';

export const ModalView: FC<ModalViewProps> = ({
	isOpen,
	clientKey,
	userKey,
	contractKey,
}) => {
	const { setParam, getParam } = useSaveParams();
	// if (!process.env.SENDFORSIGN_API_KEY) {
	//  TO DO
	// }
	// dayjs.extend(utc);
	// const dispatch = useDispatch();
	// const history = useHistory();
	// const contract = useSelector(contractSelector);
	// const contractValue = useSelector(contractValueSelector);
	// const sign = useSelector(signSelector);
	// const contractSign = useSelector(contractSignSelector);
	// const createContract = useSelector(createContractSelector);
	// const templateLoading = useSelector(loadingSelector);
	// const templateText = useSelector(templateTextSelector);
	// const textState = useSelector(textSelector);
	// const [spinLoad, setSpinLoad] = useState(true);
	const [value, setValue] = useState('');
	const { Title, Text } = Typography;
	// const isOpenRef = useRef(Boolean(getParam('openModal')));
	const [openModal, setOpenModal] = useState(Boolean(getParam('openModal')));
	// const { isLoaded, userId, sessionId, getToken } = useAuth();

	// const [saveValue] = useSaveContractValueMutation();
	// const [checkContractValue] = useCheckContractValueMutation();
	// const [sendEmail] = useSendEmailsSignByControlLinkMutation();

	// const { data: contractSignsData } = useGetContractSignsByControlLinkQuery(
	// 	{ controlLink: contract.controlLink, userId: userId },
	// 	{ skip: contract.controlLink ? false : true }
	// // );
	// useEffect(() => {
	// 	console.log('getParam', getParam('openModal'));
	// }, [getParam]);
	const handleCancel = () => {
		setOpenModal(false);
	};
	return (
		<Modal
			open={isOpen && openModal}
			centered
			onCancel={handleCancel}
			closable={true}
			footer={<></>}
		>
			<Space direction='vertical' size='large' style={{ display: 'flex' }}>
				<Editor
					clientKey={clientKey}
					userKey={userKey}
					contractKey={contractKey}
				/>
			</Space>
		</Modal>
	);
};
