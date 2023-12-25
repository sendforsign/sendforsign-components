import localforage from 'localforage';

export default function useSaveArrayBuffer() {
	const getArrayBuffer = async (key: string) => {
		const value = await localforage.getItem(key);
		// console.log('pdfFile getArrayBuffer', value);
		return value;
	};

	const saveArrayBuffer = async (key: string, value: ArrayBuffer) => {
		const valueTmp = await localforage.getItem(key);
		if (valueTmp) {
			await localforage.removeItem(key);
		}
		// console.log('pdfFile saveArrayBuffer', value);
		await localforage.setItem(key, value);
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
