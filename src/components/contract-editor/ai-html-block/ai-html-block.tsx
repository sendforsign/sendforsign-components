import React, { useEffect, useRef, useState } from 'react';
import { AiAssistant } from '../../ai-assistant';
import { useContractEditorContext } from '../contract-editor-context';
import { AiTypes, ContractType, ContractTypeText } from '../../../config/enum';

export const AiHtmlBlock = () => {
	const {
		apiKey,
		userKey,
		token,
		readonly,
		contractType,
		contractKey,
		contractName,
		clientKey,
		placeholder,
		refreshPlaceholders,
		AiVisible,
	} = useContractEditorContext();
	const [currPlaceholder, setCurrPlaceholder] = useState(refreshPlaceholders);

	const readonlyCurrent = useRef(false);
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
			apiKey={apiKey ? apiKey : ''}
			clientKey={clientKey ? clientKey : ''}
			token={token ? token : ''}
			userKey={userKey ? userKey : ''}
			aitype={AiTypes.CONTRACT_SIDEBAR}
			contract={{ contractName, controlLink: contractKey }}
		/>
	);
};
