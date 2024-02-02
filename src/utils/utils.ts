import * as Mammoth from 'mammoth/mammoth.browser';
import QuillNamespace from 'quill';

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
export const addBlotClass = (index: number) => {
	let Inline = QuillNamespace.import('blots/inline');
	switch (index) {
		case 1:
			class PlaceholderBlot1 extends Inline {}
			PlaceholderBlot1.className = `placeholderClass${index}`;
			PlaceholderBlot1.blotName = `placeholder${index}`;
			PlaceholderBlot1.tagName = `placeholder${index}`;
			QuillNamespace.register(PlaceholderBlot1);
			break;
		case 2:
			class PlaceholderBlot2 extends Inline {}
			PlaceholderBlot2.className = `placeholderClass${index}`;
			PlaceholderBlot2.blotName = `placeholder${index}`;
			PlaceholderBlot2.tagName = `placeholder${index}`;
			QuillNamespace.register(PlaceholderBlot2);
			break;
		case 3:
			class PlaceholderBlot3 extends Inline {}
			PlaceholderBlot3.className = `placeholderClass${index}`;
			PlaceholderBlot3.blotName = `placeholder${index}`;
			PlaceholderBlot3.tagName = `placeholder${index}`;
			QuillNamespace.register(PlaceholderBlot3);
			break;
		case 4:
			class PlaceholderBlot4 extends Inline {}
			PlaceholderBlot4.className = `placeholderClass${index}`;
			PlaceholderBlot4.blotName = `placeholder${index}`;
			PlaceholderBlot4.tagName = `placeholder${index}`;
			QuillNamespace.register(PlaceholderBlot4);
			break;
		case 5:
			class PlaceholderBlot5 extends Inline {}
			PlaceholderBlot5.className = `placeholderClass${index}`;
			PlaceholderBlot5.blotName = `placeholder${index}`;
			PlaceholderBlot5.tagName = `placeholder${index}`;
			QuillNamespace.register(PlaceholderBlot5);
			break;
		case 6:
			class PlaceholderBlot6 extends Inline {}
			PlaceholderBlot6.className = `placeholderClass${index}`;
			PlaceholderBlot6.blotName = `placeholder${index}`;
			PlaceholderBlot6.tagName = `placeholder${index}`;
			QuillNamespace.register(PlaceholderBlot6);
			break;
		case 7:
			class PlaceholderBlot7 extends Inline {}
			PlaceholderBlot7.className = `placeholderClass${index}`;
			PlaceholderBlot7.blotName = `placeholder${index}`;
			PlaceholderBlot7.tagName = `placeholder${index}`;
			QuillNamespace.register(PlaceholderBlot7);
			break;
		case 8:
			class PlaceholderBlot8 extends Inline {}
			PlaceholderBlot8.className = `placeholderClass${index}`;
			PlaceholderBlot8.blotName = `placeholder${index}`;
			PlaceholderBlot8.tagName = `placeholder${index}`;
			QuillNamespace.register(PlaceholderBlot8);
			break;
		case 9:
			class PlaceholderBlot9 extends Inline {}
			PlaceholderBlot9.className = `placeholderClass${index}`;
			PlaceholderBlot9.blotName = `placeholder${index}`;
			PlaceholderBlot9.tagName = `placeholder${index}`;
			QuillNamespace.register(PlaceholderBlot9);
			break;
		case 10:
			class PlaceholderBlot10 extends Inline {}
			PlaceholderBlot10.className = `placeholderClass${index}`;
			PlaceholderBlot10.blotName = `placeholder${index}`;
			PlaceholderBlot10.tagName = `placeholder${index}`;
			QuillNamespace.register(PlaceholderBlot10);
			break;
		case 11:
			class PlaceholderBlot11 extends Inline {}
			PlaceholderBlot11.className = `placeholderClass${index}`;
			PlaceholderBlot11.blotName = `placeholder${index}`;
			PlaceholderBlot11.tagName = `placeholder${index}`;
			QuillNamespace.register(PlaceholderBlot11);
			break;
		case 12:
			class PlaceholderBlot12 extends Inline {}
			PlaceholderBlot12.className = `placeholderClass${index}`;
			PlaceholderBlot12.blotName = `placeholder${index}`;
			PlaceholderBlot12.tagName = `placeholder${index}`;
			QuillNamespace.register(PlaceholderBlot12);
			break;
		case 13:
			class PlaceholderBlot13 extends Inline {}
			PlaceholderBlot13.className = `placeholderClass${index}`;
			PlaceholderBlot13.blotName = `placeholder${index}`;
			PlaceholderBlot13.tagName = `placeholder${index}`;
			QuillNamespace.register(PlaceholderBlot13);
			break;
		case 14:
			class PlaceholderBlot14 extends Inline {}
			PlaceholderBlot14.className = `placeholderClass${index}`;
			PlaceholderBlot14.blotName = `placeholder${index}`;
			PlaceholderBlot14.tagName = `placeholder${index}`;
			QuillNamespace.register(PlaceholderBlot14);
			break;
		case 15:
			class PlaceholderBlot15 extends Inline {}
			PlaceholderBlot15.className = `placeholderClass${index}`;
			PlaceholderBlot15.blotName = `placeholder${index}`;
			PlaceholderBlot15.tagName = `placeholder${index}`;
			QuillNamespace.register(PlaceholderBlot15);
			break;
		case 16:
			class PlaceholderBlot16 extends Inline {}
			PlaceholderBlot16.className = `placeholderClass${index}`;
			PlaceholderBlot16.blotName = `placeholder${index}`;
			PlaceholderBlot16.tagName = `placeholder${index}`;
			QuillNamespace.register(PlaceholderBlot16);
			break;
		case 17:
			class PlaceholderBlot17 extends Inline {}
			PlaceholderBlot17.className = `placeholderClass${index}`;
			PlaceholderBlot17.blotName = `placeholder${index}`;
			PlaceholderBlot17.tagName = `placeholder${index}`;
			QuillNamespace.register(PlaceholderBlot17);
			break;
		case 18:
			class PlaceholderBlot18 extends Inline {}
			PlaceholderBlot18.className = `placeholderClass${index}`;
			PlaceholderBlot18.blotName = `placeholder${index}`;
			PlaceholderBlot18.tagName = `placeholder${index}`;
			QuillNamespace.register(PlaceholderBlot18);
			break;
		case 19:
			class PlaceholderBlot19 extends Inline {}
			PlaceholderBlot19.className = `placeholderClass${index}`;
			PlaceholderBlot19.blotName = `placeholder${index}`;
			PlaceholderBlot19.tagName = `placeholder${index}`;
			QuillNamespace.register(PlaceholderBlot19);
			break;
		case 20:
			class PlaceholderBlot20 extends Inline {}
			PlaceholderBlot20.className = `placeholderClass${index}`;
			PlaceholderBlot20.blotName = `placeholder${index}`;
			PlaceholderBlot20.tagName = `placeholder${index}`;
			QuillNamespace.register(PlaceholderBlot20);
			break;
		case 21:
			class PlaceholderBlot21 extends Inline {}
			PlaceholderBlot21.className = `placeholderClass${index}`;
			PlaceholderBlot21.blotName = `placeholder${index}`;
			PlaceholderBlot21.tagName = `placeholder${index}`;
			QuillNamespace.register(PlaceholderBlot21);
			break;
		case 22:
			class PlaceholderBlot22 extends Inline {}
			PlaceholderBlot22.className = `placeholderClass${index}`;
			PlaceholderBlot22.blotName = `placeholder${index}`;
			PlaceholderBlot22.tagName = `placeholder${index}`;
			QuillNamespace.register(PlaceholderBlot22);
			break;
		case 23:
			class PlaceholderBlot23 extends Inline {}
			PlaceholderBlot23.className = `placeholderClass${index}`;
			PlaceholderBlot23.blotName = `placeholder${index}`;
			PlaceholderBlot23.tagName = `placeholder${index}`;
			QuillNamespace.register(PlaceholderBlot23);
			break;
		case 24:
			class PlaceholderBlot24 extends Inline {}
			PlaceholderBlot24.className = `placeholderClass${index}`;
			PlaceholderBlot24.blotName = `placeholder${index}`;
			PlaceholderBlot24.tagName = `placeholder${index}`;
			QuillNamespace.register(PlaceholderBlot24);
			break;
		case 25:
			class PlaceholderBlot25 extends Inline {}
			PlaceholderBlot25.className = `placeholderClass${index}`;
			PlaceholderBlot25.blotName = `placeholder${index}`;
			PlaceholderBlot25.tagName = `placeholder${index}`;
			QuillNamespace.register(PlaceholderBlot25);
			break;
		case 26:
			class PlaceholderBlot26 extends Inline {}
			PlaceholderBlot26.className = `placeholderClass${index}`;
			PlaceholderBlot26.blotName = `placeholder${index}`;
			PlaceholderBlot26.tagName = `placeholder${index}`;
			QuillNamespace.register(PlaceholderBlot26);
			break;
		case 27:
			class PlaceholderBlot27 extends Inline {}
			PlaceholderBlot27.className = `placeholderClass${index}`;
			PlaceholderBlot27.blotName = `placeholder${index}`;
			PlaceholderBlot27.tagName = `placeholder${index}`;
			QuillNamespace.register(PlaceholderBlot27);
			break;
		case 28:
			class PlaceholderBlot28 extends Inline {}
			PlaceholderBlot28.className = `placeholderClass${index}`;
			PlaceholderBlot28.blotName = `placeholder${index}`;
			PlaceholderBlot28.tagName = `placeholder${index}`;
			QuillNamespace.register(PlaceholderBlot28);
			break;
		case 29:
			class PlaceholderBlot29 extends Inline {}
			PlaceholderBlot29.className = `placeholderClass${index}`;
			PlaceholderBlot29.blotName = `placeholder${index}`;
			PlaceholderBlot29.tagName = `placeholder${index}`;
			QuillNamespace.register(PlaceholderBlot29);
			break;
		case 30:
			class PlaceholderBlot30 extends Inline {}
			PlaceholderBlot30.className = `placeholderClass${index}`;
			PlaceholderBlot30.blotName = `placeholder${index}`;
			PlaceholderBlot30.tagName = `placeholder${index}`;
			QuillNamespace.register(PlaceholderBlot30);
			break;
		case 31:
			class PlaceholderBlot31 extends Inline {}
			PlaceholderBlot31.className = `placeholderClass${index}`;
			PlaceholderBlot31.blotName = `placeholder${index}`;
			PlaceholderBlot31.tagName = `placeholder${index}`;
			QuillNamespace.register(PlaceholderBlot31);
			break;
		case 32:
			class PlaceholderBlot32 extends Inline {}
			PlaceholderBlot32.className = `placeholderClass${index}`;
			PlaceholderBlot32.blotName = `placeholder${index}`;
			PlaceholderBlot32.tagName = `placeholder${index}`;
			QuillNamespace.register(PlaceholderBlot32);
			break;
		case 33:
			class PlaceholderBlot33 extends Inline {}
			PlaceholderBlot33.className = `placeholderClass${index}`;
			PlaceholderBlot33.blotName = `placeholder${index}`;
			PlaceholderBlot33.tagName = `placeholder${index}`;
			QuillNamespace.register(PlaceholderBlot33);
			break;
		case 34:
			class PlaceholderBlot34 extends Inline {}
			PlaceholderBlot34.className = `placeholderClass${index}`;
			PlaceholderBlot34.blotName = `placeholder${index}`;
			PlaceholderBlot34.tagName = `placeholder${index}`;
			QuillNamespace.register(PlaceholderBlot34);
			break;
		case 35:
			class PlaceholderBlot35 extends Inline {}
			PlaceholderBlot35.className = `placeholderClass${index}`;
			PlaceholderBlot35.blotName = `placeholder${index}`;
			PlaceholderBlot35.tagName = `placeholder${index}`;
			QuillNamespace.register(PlaceholderBlot35);
			break;
		case 36:
			class PlaceholderBlot36 extends Inline {}
			PlaceholderBlot36.className = `placeholderClass${index}`;
			PlaceholderBlot36.blotName = `placeholder${index}`;
			PlaceholderBlot36.tagName = `placeholder${index}`;
			QuillNamespace.register(PlaceholderBlot36);
			break;
		case 37:
			class PlaceholderBlot37 extends Inline {}
			PlaceholderBlot37.className = `placeholderClass${index}`;
			PlaceholderBlot37.blotName = `placeholder${index}`;
			PlaceholderBlot37.tagName = `placeholder${index}`;
			QuillNamespace.register(PlaceholderBlot37);
			break;
		case 38:
			class PlaceholderBlot38 extends Inline {}
			PlaceholderBlot38.className = `placeholderClass${index}`;
			PlaceholderBlot38.blotName = `placeholder${index}`;
			PlaceholderBlot38.tagName = `placeholder${index}`;
			QuillNamespace.register(PlaceholderBlot38);
			break;
		case 39:
			class PlaceholderBlot39 extends Inline {}
			PlaceholderBlot39.className = `placeholderClass${index}`;
			PlaceholderBlot39.blotName = `placeholder${index}`;
			PlaceholderBlot39.tagName = `placeholder${index}`;
			QuillNamespace.register(PlaceholderBlot39);
			break;
		case 40:
			class PlaceholderBlot40 extends Inline {}
			PlaceholderBlot40.className = `placeholderClass${index}`;
			PlaceholderBlot40.blotName = `placeholder${index}`;
			PlaceholderBlot40.tagName = `placeholder${index}`;
			QuillNamespace.register(PlaceholderBlot40);
			break;
	}
};
