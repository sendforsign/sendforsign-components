import localforage from 'localforage';

export default function useSaveArrayBuffer() {
	const getArrayBuffer = async (key: string) => {
		let value: ArrayBuffer | undefined;
		await localforage.getItem<ArrayBuffer>(key).then((getItemValue) => {
			value = getItemValue as ArrayBuffer;
		});
		return value;
	};

	const saveArrayBuffer = async (key: string, value: ArrayBuffer) => {
		const valueTmp: ArrayBuffer = (await localforage.getItem<ArrayBuffer>(
			key
		)) as ArrayBuffer;
		if (valueTmp) {
			await localforage.removeItem(key);
		}
		// //console.log('pdfFile saveArrayBuffer', value);
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
