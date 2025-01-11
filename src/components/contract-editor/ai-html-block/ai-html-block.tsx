import React, { useEffect, useRef, useState } from 'react';
import { TemplateList } from '../../template-list';
import { AiAssistant } from '../../ai-assistant';
import {
	Space,
	Card,
	Typography,
	Button,
	Input,
	Radio,
	Row,
	Tooltip,
	Col,
	Popover,
	Divider,
	Select,
} from 'antd';
import QuillNamespace from 'quill';
import { useContractEditorContext } from '../contract-editor-context';
import { BASE_URL } from '../../../config/config';
import {
	Action,
	ApiEntity,
	ContractType,
	ContractTypeText,
	PlaceholderColor,
	PlaceholderFill,
	PlaceholderTypeText,
	PlaceholderView,
	SpecialType,
	Tags,
} from '../../../config/enum';
import axios from 'axios';
import { Placeholder, Recipient } from '../../../config/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	faCircle,
	faCircleQuestion,
	faClose,
	faFont,
	faGear,
	faLeftLong,
	faSignature,
} from '@fortawesome/free-solid-svg-icons';
import { parseDate } from 'pdf-lib';
import { addActualColors, changeValueInTag, getIcon } from '../../../utils';

type Props = {
	quillRef: React.MutableRefObject<QuillNamespace | undefined>;
};
type Option = { value: string; label: React.JSX.Element };
export const AiHtmlBlock = ({ quillRef }: Props) => {
	const {
		apiKey,
		userKey,
		token,
		readonly,
		contractType,
		contractKey,
		clientKey,
		placeholder,
		continueLoad,
		setPlaceholder,
		refreshPlaceholders,
		setPlaceholderVisible,
		placeholderVisible,
		setAiVisible,
		AiVisible,
		setNotification,
		contractPlaceholderCount,
		setContractPlaceholderCount,
		refreshPagePlaceholders,
		setRefreshPagePlaceholders,
	} = useContractEditorContext();
	const [currPlaceholder, setCurrPlaceholder] = useState(refreshPlaceholders);
	const [placeholderLoad, setPlaceholderLoad] = useState(false);
	const [delLoad, setDelLoad] = useState(false);
	const [selectPlaceholder, setSelectPlaceholder] = useState<Option[]>([]);
	const [selectedPlaceholders, setSelectedPlaceholders] = useState<
		Placeholder[]
	>([]);
	const [selectedOtion, setSelectedOtion] = useState('0');
	const readonlyCurrent = useRef(false);
	// const selectedOtion = useRef('0');
	const placeholderRecipients = useRef<Recipient[]>([]);

	const { Title, Text } = Typography;

	
	

	useEffect(() => {
		let isMounted = true;
		if (
			contractType.toString() !== ContractType.PDF.toString() &&
			contractType.toString() !== ContractTypeText.PDF.toString() &&
			contractKey &&
			(clientKey || token) &&
			AiVisible &&
			(refreshPlaceholders || !placeholder || placeholder.length === 0)
		) {
			setCurrPlaceholder(refreshPlaceholders);
		}
		return () => {
			isMounted = false;
		};
	}, [refreshPlaceholders, AiVisible]);
	useEffect(() => {
		if (readonly) {
			readonlyCurrent.current = true;
		}
	}, [readonly]);
	
	return (
		<AiAssistant 
			apiKey={apiKey}
			clientKey={clientKey}
			token={token}
			userKey={userKey}
		/> 
	);
};
