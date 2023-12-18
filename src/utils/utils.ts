import * as Mammoth from 'mammoth/mammoth.browser';

export const docx2html = (content: ArrayBuffer, callback?: any) => {
	Mammoth.convertToHtml({ arrayBuffer: content })
		.then(function (result: any) {
			callback(result.value); // The generated HTML
			// let messages = result.messages; // Any messages, such as warnings during conversion
		})
		.catch(function (error: any) {
			console.error(error);
		});
};
