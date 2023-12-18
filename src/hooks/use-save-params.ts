import { useState } from 'react';
export default function useSaveParams() {
	const getParam = (name: string) => {
		let value = '';
		let valueString = localStorage.getItem(name);
		if (valueString) {
			value = JSON.parse(valueString);
		}
		return value;
	};

	// const [param, setParam] = useState(getParam(''));
	const setParam = (name: string, value: any) => {
		if (name && value) {
			localStorage.setItem(name, JSON.stringify(value));
		}
	};
	const clearParams = () => {
		localStorage.clear();
	}; 
	return { setParam, getParam, clearParams };
}
