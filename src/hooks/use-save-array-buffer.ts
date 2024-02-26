import localforage from 'localforage';

export default function useSaveArrayBuffer() {
	const getArrayBuffer = async (key: string) => {
		let value: ArrayBuffer;
		await localforage.getItem<ArrayBuffer>(key).then((getItemValue) => {
			value = getItemValue;
		});
		return value as ArrayBuffer;
	};

	const saveArrayBuffer = async (key: string, value: ArrayBuffer) => {
		const valueTmp: ArrayBuffer = await localforage.getItem<ArrayBuffer>(key);
		if (valueTmp) {
			await localforage.removeItem(key);
		}
		// console.log('pdfFile saveArrayBuffer', value);
		await localforage.setItem<ArrayBuffer>(key, value);
	};
	const clearArrayBuffer = async () => {
		await localforage.clear();
	};
	return {
		setArrayBuffer: saveArrayBuffer,
		getArrayBuffer,
		clearArrayBuffer,
	};
}
