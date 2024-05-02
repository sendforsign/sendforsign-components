import * as Mammoth from 'mammoth/mammoth.browser';
import QuillNamespace from 'quill';
import Inline from 'quill/blots/inline';
// const Inline = QuillNamespace.import('blots/inline');

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
	switch (index) {
		case 1:
			class PlaceholderBlot1 extends Inline {
				static contenteditable: string;
			}
			PlaceholderBlot1.className = `placeholderClass${index}`;
			PlaceholderBlot1.blotName = `placeholder${index}`;
			PlaceholderBlot1.tagName = `placeholder${index}`;
			PlaceholderBlot1.contenteditable = 'false';
			QuillNamespace.register(PlaceholderBlot1);
			break;
		case 2:
			class PlaceholderBlot2 extends Inline {
				static contenteditable: string;
			}
			PlaceholderBlot2.className = `placeholderClass${index}`;
			PlaceholderBlot2.blotName = `placeholder${index}`;
			PlaceholderBlot2.tagName = `placeholder${index}`;
			PlaceholderBlot2.contenteditable = 'false';
			QuillNamespace.register(PlaceholderBlot2);
			break;
		case 3:
			class PlaceholderBlot3 extends Inline {
				static contenteditable: string;
			}
			PlaceholderBlot3.className = `placeholderClass${index}`;
			PlaceholderBlot3.blotName = `placeholder${index}`;
			PlaceholderBlot3.tagName = `placeholder${index}`;
			PlaceholderBlot3.contenteditable = 'false';
			QuillNamespace.register(PlaceholderBlot3);
			break;
		case 4:
			class PlaceholderBlot4 extends Inline {
				static contenteditable: string;
			}
			PlaceholderBlot4.className = `placeholderClass${index}`;
			PlaceholderBlot4.blotName = `placeholder${index}`;
			PlaceholderBlot4.tagName = `placeholder${index}`;
			PlaceholderBlot4.contenteditable = 'false';
			QuillNamespace.register(PlaceholderBlot4);
			break;
		case 5:
			class PlaceholderBlot5 extends Inline {
				static contenteditable: string;
			}
			PlaceholderBlot5.className = `placeholderClass${index}`;
			PlaceholderBlot5.blotName = `placeholder${index}`;
			PlaceholderBlot5.tagName = `placeholder${index}`;
			PlaceholderBlot5.contenteditable = 'false';
			QuillNamespace.register(PlaceholderBlot5);
			break;
		case 6:
			class PlaceholderBlot6 extends Inline {
				static contenteditable: string;
			}
			PlaceholderBlot6.className = `placeholderClass${index}`;
			PlaceholderBlot6.blotName = `placeholder${index}`;
			PlaceholderBlot6.tagName = `placeholder${index}`;
			PlaceholderBlot6.contenteditable = 'false';
			QuillNamespace.register(PlaceholderBlot6);
			break;
		case 7:
			class PlaceholderBlot7 extends Inline {
				static contenteditable: string;
			}
			PlaceholderBlot7.className = `placeholderClass${index}`;
			PlaceholderBlot7.blotName = `placeholder${index}`;
			PlaceholderBlot7.tagName = `placeholder${index}`;
			PlaceholderBlot7.contenteditable = 'false';
			QuillNamespace.register(PlaceholderBlot7);
			break;
		case 8:
			class PlaceholderBlot8 extends Inline {
				static contenteditable: string;
			}
			PlaceholderBlot8.className = `placeholderClass${index}`;
			PlaceholderBlot8.blotName = `placeholder${index}`;
			PlaceholderBlot8.tagName = `placeholder${index}`;
			PlaceholderBlot8.contenteditable = 'false';
			QuillNamespace.register(PlaceholderBlot8);
			break;
		case 9:
			class PlaceholderBlot9 extends Inline {
				static contenteditable: string;
			}
			PlaceholderBlot9.className = `placeholderClass${index}`;
			PlaceholderBlot9.blotName = `placeholder${index}`;
			PlaceholderBlot9.tagName = `placeholder${index}`;
			PlaceholderBlot9.contenteditable = 'false';
			QuillNamespace.register(PlaceholderBlot9);
			break;
		case 10:
			class PlaceholderBlot10 extends Inline {
				static contenteditable: string;
			}
			PlaceholderBlot10.className = `placeholderClass${index}`;
			PlaceholderBlot10.blotName = `placeholder${index}`;
			PlaceholderBlot10.tagName = `placeholder${index}`;
			PlaceholderBlot10.contenteditable = 'false';
			QuillNamespace.register(PlaceholderBlot10);
			break;
		case 11:
			class PlaceholderBlot11 extends Inline {
				static contenteditable: string;
			}
			PlaceholderBlot11.className = `placeholderClass${index}`;
			PlaceholderBlot11.blotName = `placeholder${index}`;
			PlaceholderBlot11.tagName = `placeholder${index}`;
			PlaceholderBlot11.contenteditable = 'false';
			QuillNamespace.register(PlaceholderBlot11);
			break;
		case 12:
			class PlaceholderBlot12 extends Inline {
				static contenteditable: string;
			}
			PlaceholderBlot12.className = `placeholderClass${index}`;
			PlaceholderBlot12.blotName = `placeholder${index}`;
			PlaceholderBlot12.tagName = `placeholder${index}`;
			PlaceholderBlot12.contenteditable = 'false';
			QuillNamespace.register(PlaceholderBlot12);
			break;
		case 13:
			class PlaceholderBlot13 extends Inline {
				static contenteditable: string;
			}
			PlaceholderBlot13.className = `placeholderClass${index}`;
			PlaceholderBlot13.blotName = `placeholder${index}`;
			PlaceholderBlot13.tagName = `placeholder${index}`;
			PlaceholderBlot13.contenteditable = 'false';
			QuillNamespace.register(PlaceholderBlot13);
			break;
		case 14:
			class PlaceholderBlot14 extends Inline {
				static contenteditable: string;
			}
			PlaceholderBlot14.className = `placeholderClass${index}`;
			PlaceholderBlot14.blotName = `placeholder${index}`;
			PlaceholderBlot14.tagName = `placeholder${index}`;
			PlaceholderBlot14.contenteditable = 'false';
			QuillNamespace.register(PlaceholderBlot14);
			break;
		case 15:
			class PlaceholderBlot15 extends Inline {
				static contenteditable: string;
			}
			PlaceholderBlot15.className = `placeholderClass${index}`;
			PlaceholderBlot15.blotName = `placeholder${index}`;
			PlaceholderBlot15.tagName = `placeholder${index}`;
			PlaceholderBlot15.contenteditable = 'false';
			QuillNamespace.register(PlaceholderBlot15);
			break;
		case 16:
			class PlaceholderBlot16 extends Inline {
				static contenteditable: string;
			}
			PlaceholderBlot16.className = `placeholderClass${index}`;
			PlaceholderBlot16.blotName = `placeholder${index}`;
			PlaceholderBlot16.tagName = `placeholder${index}`;
			PlaceholderBlot16.contenteditable = 'false';
			QuillNamespace.register(PlaceholderBlot16);
			break;
		case 17:
			class PlaceholderBlot17 extends Inline {
				static contenteditable: string;
			}
			PlaceholderBlot17.className = `placeholderClass${index}`;
			PlaceholderBlot17.blotName = `placeholder${index}`;
			PlaceholderBlot17.tagName = `placeholder${index}`;
			PlaceholderBlot17.contenteditable = 'false';
			QuillNamespace.register(PlaceholderBlot17);
			break;
		case 18:
			class PlaceholderBlot18 extends Inline {
				static contenteditable: string;
			}
			PlaceholderBlot18.className = `placeholderClass${index}`;
			PlaceholderBlot18.blotName = `placeholder${index}`;
			PlaceholderBlot18.tagName = `placeholder${index}`;
			PlaceholderBlot18.contenteditable = 'false';
			QuillNamespace.register(PlaceholderBlot18);
			break;
		case 19:
			class PlaceholderBlot19 extends Inline {
				static contenteditable: string;
			}
			PlaceholderBlot19.className = `placeholderClass${index}`;
			PlaceholderBlot19.blotName = `placeholder${index}`;
			PlaceholderBlot19.tagName = `placeholder${index}`;
			PlaceholderBlot19.contenteditable = 'false';
			QuillNamespace.register(PlaceholderBlot19);
			break;
		case 20:
			class PlaceholderBlot20 extends Inline {
				static contenteditable: string;
			}
			PlaceholderBlot20.className = `placeholderClass${index}`;
			PlaceholderBlot20.blotName = `placeholder${index}`;
			PlaceholderBlot20.tagName = `placeholder${index}`;
			PlaceholderBlot20.contenteditable = 'false';
			QuillNamespace.register(PlaceholderBlot20);
			break;
		case 21:
			class PlaceholderBlot21 extends Inline {
				static contenteditable: string;
			}
			PlaceholderBlot21.className = `placeholderClass${index}`;
			PlaceholderBlot21.blotName = `placeholder${index}`;
			PlaceholderBlot21.tagName = `placeholder${index}`;
			PlaceholderBlot21.contenteditable = 'false';
			QuillNamespace.register(PlaceholderBlot21);
			break;
		case 22:
			class PlaceholderBlot22 extends Inline {
				static contenteditable: string;
			}
			PlaceholderBlot22.className = `placeholderClass${index}`;
			PlaceholderBlot22.blotName = `placeholder${index}`;
			PlaceholderBlot22.tagName = `placeholder${index}`;
			PlaceholderBlot22.contenteditable = 'false';
			QuillNamespace.register(PlaceholderBlot22);
			break;
		case 23:
			class PlaceholderBlot23 extends Inline {
				static contenteditable: string;
			}
			PlaceholderBlot23.className = `placeholderClass${index}`;
			PlaceholderBlot23.blotName = `placeholder${index}`;
			PlaceholderBlot23.tagName = `placeholder${index}`;
			PlaceholderBlot23.contenteditable = 'false';
			QuillNamespace.register(PlaceholderBlot23);
			break;
		case 24:
			class PlaceholderBlot24 extends Inline {
				static contenteditable: string;
			}
			PlaceholderBlot24.className = `placeholderClass${index}`;
			PlaceholderBlot24.blotName = `placeholder${index}`;
			PlaceholderBlot24.tagName = `placeholder${index}`;
			PlaceholderBlot24.contenteditable = 'false';
			QuillNamespace.register(PlaceholderBlot24);
			break;
		case 25:
			class PlaceholderBlot25 extends Inline {
				static contenteditable: string;
			}
			PlaceholderBlot25.className = `placeholderClass${index}`;
			PlaceholderBlot25.blotName = `placeholder${index}`;
			PlaceholderBlot25.tagName = `placeholder${index}`;
			PlaceholderBlot25.contenteditable = 'false';
			QuillNamespace.register(PlaceholderBlot25);
			break;
		case 26:
			class PlaceholderBlot26 extends Inline {
				static contenteditable: string;
			}
			PlaceholderBlot26.className = `placeholderClass${index}`;
			PlaceholderBlot26.blotName = `placeholder${index}`;
			PlaceholderBlot26.tagName = `placeholder${index}`;
			PlaceholderBlot26.contenteditable = 'false';
			QuillNamespace.register(PlaceholderBlot26);
			break;
		case 27:
			class PlaceholderBlot27 extends Inline {
				static contenteditable: string;
			}
			PlaceholderBlot27.className = `placeholderClass${index}`;
			PlaceholderBlot27.blotName = `placeholder${index}`;
			PlaceholderBlot27.tagName = `placeholder${index}`;
			PlaceholderBlot27.contenteditable = 'false';
			QuillNamespace.register(PlaceholderBlot27);
			break;
		case 28:
			class PlaceholderBlot28 extends Inline {
				static contenteditable: string;
			}
			PlaceholderBlot28.className = `placeholderClass${index}`;
			PlaceholderBlot28.blotName = `placeholder${index}`;
			PlaceholderBlot28.tagName = `placeholder${index}`;
			PlaceholderBlot28.contenteditable = 'false';
			QuillNamespace.register(PlaceholderBlot28);
			break;
		case 29:
			class PlaceholderBlot29 extends Inline {
				static contenteditable: string;
			}
			PlaceholderBlot29.className = `placeholderClass${index}`;
			PlaceholderBlot29.blotName = `placeholder${index}`;
			PlaceholderBlot29.tagName = `placeholder${index}`;
			PlaceholderBlot29.contenteditable = 'false';
			QuillNamespace.register(PlaceholderBlot29);
			break;
		case 30:
			class PlaceholderBlot30 extends Inline {
				static contenteditable: string;
			}
			PlaceholderBlot30.className = `placeholderClass${index}`;
			PlaceholderBlot30.blotName = `placeholder${index}`;
			PlaceholderBlot30.tagName = `placeholder${index}`;
			PlaceholderBlot30.contenteditable = 'false';
			QuillNamespace.register(PlaceholderBlot30);
			break;
		case 31:
			class PlaceholderBlot31 extends Inline {
				static contenteditable: string;
			}
			PlaceholderBlot31.className = `placeholderClass${index}`;
			PlaceholderBlot31.blotName = `placeholder${index}`;
			PlaceholderBlot31.tagName = `placeholder${index}`;
			PlaceholderBlot31.contenteditable = 'false';
			QuillNamespace.register(PlaceholderBlot31);
			break;
		case 32:
			class PlaceholderBlot32 extends Inline {
				static contenteditable: string;
			}
			PlaceholderBlot32.className = `placeholderClass${index}`;
			PlaceholderBlot32.blotName = `placeholder${index}`;
			PlaceholderBlot32.tagName = `placeholder${index}`;
			PlaceholderBlot32.contenteditable = 'false';
			QuillNamespace.register(PlaceholderBlot32);
			break;
		case 33:
			class PlaceholderBlot33 extends Inline {
				static contenteditable: string;
			}
			PlaceholderBlot33.className = `placeholderClass${index}`;
			PlaceholderBlot33.blotName = `placeholder${index}`;
			PlaceholderBlot33.tagName = `placeholder${index}`;
			PlaceholderBlot33.contenteditable = 'false';
			QuillNamespace.register(PlaceholderBlot33);
			break;
		case 34:
			class PlaceholderBlot34 extends Inline {
				static contenteditable: string;
			}
			PlaceholderBlot34.className = `placeholderClass${index}`;
			PlaceholderBlot34.blotName = `placeholder${index}`;
			PlaceholderBlot34.tagName = `placeholder${index}`;
			PlaceholderBlot34.contenteditable = 'false';
			QuillNamespace.register(PlaceholderBlot34);
			break;
		case 35:
			class PlaceholderBlot35 extends Inline {
				static contenteditable: string;
			}
			PlaceholderBlot35.className = `placeholderClass${index}`;
			PlaceholderBlot35.blotName = `placeholder${index}`;
			PlaceholderBlot35.tagName = `placeholder${index}`;
			PlaceholderBlot35.contenteditable = 'false';
			QuillNamespace.register(PlaceholderBlot35);
			break;
		case 36:
			class PlaceholderBlot36 extends Inline {
				static contenteditable: string;
			}
			PlaceholderBlot36.className = `placeholderClass${index}`;
			PlaceholderBlot36.blotName = `placeholder${index}`;
			PlaceholderBlot36.tagName = `placeholder${index}`;
			PlaceholderBlot36.contenteditable = 'false';
			QuillNamespace.register(PlaceholderBlot36);
			break;
		case 37:
			class PlaceholderBlot37 extends Inline {
				static contenteditable: string;
			}
			PlaceholderBlot37.className = `placeholderClass${index}`;
			PlaceholderBlot37.blotName = `placeholder${index}`;
			PlaceholderBlot37.tagName = `placeholder${index}`;
			PlaceholderBlot37.contenteditable = 'false';
			QuillNamespace.register(PlaceholderBlot37);
			break;
		case 38:
			class PlaceholderBlot38 extends Inline {
				static contenteditable: string;
			}
			PlaceholderBlot38.className = `placeholderClass${index}`;
			PlaceholderBlot38.blotName = `placeholder${index}`;
			PlaceholderBlot38.tagName = `placeholder${index}`;
			PlaceholderBlot38.contenteditable = 'false';
			QuillNamespace.register(PlaceholderBlot38);
			break;
		case 39:
			class PlaceholderBlot39 extends Inline {
				static contenteditable: string;
			}
			PlaceholderBlot39.className = `placeholderClass${index}`;
			PlaceholderBlot39.blotName = `placeholder${index}`;
			PlaceholderBlot39.tagName = `placeholder${index}`;
			PlaceholderBlot39.contenteditable = 'false';
			QuillNamespace.register(PlaceholderBlot39);
			break;
		case 40:
			class PlaceholderBlot40 extends Inline {
				static contenteditable: string;
			}
			PlaceholderBlot40.className = `placeholderClass${index}`;
			PlaceholderBlot40.blotName = `placeholder${index}`;
			PlaceholderBlot40.tagName = `placeholder${index}`;
			PlaceholderBlot40.contenteditable = 'false';
			QuillNamespace.register(PlaceholderBlot40);
			break;
	}
};
