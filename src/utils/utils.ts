import * as Mammoth from 'mammoth/mammoth.browser';
import QuillNamespace from 'quill';
import Inline from 'quill/blots/inline';
import { Placeholder } from '../config/types';
import { PlaceholderView, SpecialType, Tags } from '../config/enum';
import {
	faAt,
	faCalendarDays,
	faFont,
	faSignature,
	faUser,
} from '@fortawesome/free-solid-svg-icons';
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
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			PlaceholderBlot1.className = `placeholderClass${index}`;
			PlaceholderBlot1.blotName = `placeholder${index}`;
			PlaceholderBlot1.tagName = `placeholder${index}`;
			QuillNamespace.register(PlaceholderBlot1);
			class Date1 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Date1.className = `dateClass${index}`;
			Date1.blotName = `date${index}`;
			Date1.tagName = `date${index}`;
			QuillNamespace.register(Date1);
			class Fullname1 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Fullname1.className = `fullnameClass${index}`;
			Fullname1.blotName = `fullname${index}`;
			Fullname1.tagName = `fullname${index}`;
			QuillNamespace.register(Fullname1);
			class Email1 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Email1.className = `emailClass${index}`;
			Email1.blotName = `email${index}`;
			Email1.tagName = `email${index}`;
			QuillNamespace.register(Email1);
			class Sign1 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Sign1.className = `signClass${index}`;
			Sign1.blotName = `sign${index}`;
			Sign1.tagName = `sign${index}`;
			QuillNamespace.register(Sign1);
			class Initials1 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Initials1.className = `initialsClass${index}`;
			Initials1.blotName = `initials${index}`;
			Initials1.tagName = `initials${index}`;
			QuillNamespace.register(Initials1);
			break;
		case 2:
			class PlaceholderBlot2 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			PlaceholderBlot2.className = `placeholderClass${index}`;
			PlaceholderBlot2.blotName = `placeholder${index}`;
			PlaceholderBlot2.tagName = `placeholder${index}`;
			QuillNamespace.register(PlaceholderBlot2);
			class Date2 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Date2.className = `dateClass${index}`;
			Date2.blotName = `date${index}`;
			Date2.tagName = `date${index}`;
			QuillNamespace.register(Date2);
			class Fullname2 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Fullname2.className = `fullnameClass${index}`;
			Fullname2.blotName = `fullname${index}`;
			Fullname2.tagName = `fullname${index}`;
			QuillNamespace.register(Fullname2);
			class Email2 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Email2.className = `emailClass${index}`;
			Email2.blotName = `email${index}`;
			Email2.tagName = `email${index}`;
			QuillNamespace.register(Email2);
			class Sign2 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Sign2.className = `signClass${index}`;
			Sign2.blotName = `sign${index}`;
			Sign2.tagName = `sign${index}`;
			QuillNamespace.register(Sign2);
			class Initials2 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Initials2.className = `initialsClass${index}`;
			Initials2.blotName = `initials${index}`;
			Initials2.tagName = `initials${index}`;
			QuillNamespace.register(Initials2);
			break;
		case 3:
			class PlaceholderBlot3 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			PlaceholderBlot3.className = `placeholderClass${index}`;
			PlaceholderBlot3.blotName = `placeholder${index}`;
			PlaceholderBlot3.tagName = `placeholder${index}`;
			QuillNamespace.register(PlaceholderBlot3);
			class Date3 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Date3.className = `dateClass${index}`;
			Date3.blotName = `date${index}`;
			Date3.tagName = `date${index}`;
			QuillNamespace.register(Date3);
			class Fullname3 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Fullname3.className = `fullnameClass${index}`;
			Fullname3.blotName = `fullname${index}`;
			Fullname3.tagName = `fullname${index}`;
			QuillNamespace.register(Fullname3);
			class Email3 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Email3.className = `emailClass${index}`;
			Email3.blotName = `email${index}`;
			Email3.tagName = `email${index}`;
			QuillNamespace.register(Email3);
			class Sign3 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Sign3.className = `signClass${index}`;
			Sign3.blotName = `sign${index}`;
			Sign3.tagName = `sign${index}`;
			QuillNamespace.register(Sign3);
			class Initials3 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Initials3.className = `initialsClass${index}`;
			Initials3.blotName = `initials${index}`;
			Initials3.tagName = `initials${index}`;
			QuillNamespace.register(Initials3);
			break;
		case 4:
			class PlaceholderBlot4 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			PlaceholderBlot4.className = `placeholderClass${index}`;
			PlaceholderBlot4.blotName = `placeholder${index}`;
			PlaceholderBlot4.tagName = `placeholder${index}`;
			QuillNamespace.register(PlaceholderBlot4);
			class Date4 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Date4.className = `dateClass${index}`;
			Date4.blotName = `date${index}`;
			Date4.tagName = `date${index}`;
			QuillNamespace.register(Date4);
			class Fullname4 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Fullname4.className = `fullnameClass${index}`;
			Fullname4.blotName = `fullname${index}`;
			Fullname4.tagName = `fullname${index}`;
			QuillNamespace.register(Fullname4);
			class Email4 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Email4.className = `emailClass${index}`;
			Email4.blotName = `email${index}`;
			Email4.tagName = `email${index}`;
			QuillNamespace.register(Email4);
			class Sign4 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Sign4.className = `signClass${index}`;
			Sign4.blotName = `sign${index}`;
			Sign4.tagName = `sign${index}`;
			QuillNamespace.register(Sign4);
			class Initials4 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Initials4.className = `initialsClass${index}`;
			Initials4.blotName = `initials${index}`;
			Initials4.tagName = `initials${index}`;
			QuillNamespace.register(Initials4);
			break;
		case 5:
			class PlaceholderBlot5 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			PlaceholderBlot5.className = `placeholderClass${index}`;
			PlaceholderBlot5.blotName = `placeholder${index}`;
			PlaceholderBlot5.tagName = `placeholder${index}`;
			QuillNamespace.register(PlaceholderBlot5);
			class Date5 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Date5.className = `dateClass${index}`;
			Date5.blotName = `date${index}`;
			Date5.tagName = `date${index}`;
			QuillNamespace.register(Date5);
			class Fullname5 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Fullname5.className = `fullnameClass${index}`;
			Fullname5.blotName = `fullname${index}`;
			Fullname5.tagName = `fullname${index}`;
			QuillNamespace.register(Fullname5);
			class Email5 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Email5.className = `emailClass${index}`;
			Email5.blotName = `email${index}`;
			Email5.tagName = `email${index}`;
			QuillNamespace.register(Email5);
			class Sign5 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Sign5.className = `signClass${index}`;
			Sign5.blotName = `sign${index}`;
			Sign5.tagName = `sign${index}`;
			QuillNamespace.register(Sign5);
			class Initials5 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Initials5.className = `initialsClass${index}`;
			Initials5.blotName = `initials${index}`;
			Initials5.tagName = `initials${index}`;
			QuillNamespace.register(Initials5);
			break;
		case 6:
			class PlaceholderBlot6 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			PlaceholderBlot6.className = `placeholderClass${index}`;
			PlaceholderBlot6.blotName = `placeholder${index}`;
			PlaceholderBlot6.tagName = `placeholder${index}`;
			QuillNamespace.register(PlaceholderBlot6);
			class Date6 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Date6.className = `dateClass${index}`;
			Date6.blotName = `date${index}`;
			Date6.tagName = `date${index}`;
			QuillNamespace.register(Date6);
			class Fullname6 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Fullname6.className = `fullnameClass${index}`;
			Fullname6.blotName = `fullname${index}`;
			Fullname6.tagName = `fullname${index}`;
			QuillNamespace.register(Fullname6);
			class Email6 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Email6.className = `emailClass${index}`;
			Email6.blotName = `email${index}`;
			Email6.tagName = `email${index}`;
			QuillNamespace.register(Email6);
			class Sign6 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Sign6.className = `signClass${index}`;
			Sign6.blotName = `sign${index}`;
			Sign6.tagName = `sign${index}`;
			QuillNamespace.register(Sign6);
			class Initials6 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Initials6.className = `initialsClass${index}`;
			Initials6.blotName = `initials${index}`;
			Initials6.tagName = `initials${index}`;
			QuillNamespace.register(Initials6);
			break;
		case 7:
			class PlaceholderBlot7 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			PlaceholderBlot7.className = `placeholderClass${index}`;
			PlaceholderBlot7.blotName = `placeholder${index}`;
			PlaceholderBlot7.tagName = `placeholder${index}`;
			QuillNamespace.register(PlaceholderBlot7);
			class Date7 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Date7.className = `dateClass${index}`;
			Date7.blotName = `date${index}`;
			Date7.tagName = `date${index}`;
			QuillNamespace.register(Date7);
			class Fullname7 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Fullname7.className = `fullnameClass${index}`;
			Fullname7.blotName = `fullname${index}`;
			Fullname7.tagName = `fullname${index}`;
			QuillNamespace.register(Fullname7);
			class Email7 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Email7.className = `emailClass${index}`;
			Email7.blotName = `email${index}`;
			Email7.tagName = `email${index}`;
			QuillNamespace.register(Email7);
			class Sign7 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Sign7.className = `signClass${index}`;
			Sign7.blotName = `sign${index}`;
			Sign7.tagName = `sign${index}`;
			QuillNamespace.register(Sign7);
			class Initials7 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Initials7.className = `initialsClass${index}`;
			Initials7.blotName = `initials${index}`;
			Initials7.tagName = `initials${index}`;
			QuillNamespace.register(Initials7);
			break;
		case 8:
			class PlaceholderBlot8 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			PlaceholderBlot8.className = `placeholderClass${index}`;
			PlaceholderBlot8.blotName = `placeholder${index}`;
			PlaceholderBlot8.tagName = `placeholder${index}`;
			QuillNamespace.register(PlaceholderBlot8);
			class Date8 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Date8.className = `dateClass${index}`;
			Date8.blotName = `date${index}`;
			Date8.tagName = `date${index}`;
			QuillNamespace.register(Date8);
			class Fullname8 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Fullname8.className = `fullnameClass${index}`;
			Fullname8.blotName = `fullname${index}`;
			Fullname8.tagName = `fullname${index}`;
			QuillNamespace.register(Fullname8);
			class Email8 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Email8.className = `emailClass${index}`;
			Email8.blotName = `email${index}`;
			Email8.tagName = `email${index}`;
			QuillNamespace.register(Email8);
			class Sign8 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Sign8.className = `signClass${index}`;
			Sign8.blotName = `sign${index}`;
			Sign8.tagName = `sign${index}`;
			QuillNamespace.register(Sign8);
			class Initials8 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Initials8.className = `initialsClass${index}`;
			Initials8.blotName = `initials${index}`;
			Initials8.tagName = `initials${index}`;
			QuillNamespace.register(Initials8);
			break;
		case 9:
			class PlaceholderBlot9 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			PlaceholderBlot9.className = `placeholderClass${index}`;
			PlaceholderBlot9.blotName = `placeholder${index}`;
			PlaceholderBlot9.tagName = `placeholder${index}`;
			QuillNamespace.register(PlaceholderBlot9);
			class Date9 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Date9.className = `dateClass${index}`;
			Date9.blotName = `date${index}`;
			Date9.tagName = `date${index}`;
			QuillNamespace.register(Date9);
			class Fullname9 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Fullname9.className = `fullnameClass${index}`;
			Fullname9.blotName = `fullname${index}`;
			Fullname9.tagName = `fullname${index}`;
			QuillNamespace.register(Fullname9);
			class Email9 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Email9.className = `emailClass${index}`;
			Email9.blotName = `email${index}`;
			Email9.tagName = `email${index}`;
			QuillNamespace.register(Email9);
			class Sign9 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Sign9.className = `signClass${index}`;
			Sign9.blotName = `sign${index}`;
			Sign9.tagName = `sign${index}`;
			QuillNamespace.register(Sign9);
			class Initials9 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Initials9.className = `initialsClass${index}`;
			Initials9.blotName = `initials${index}`;
			Initials9.tagName = `initials${index}`;
			QuillNamespace.register(Initials9);
			break;
		case 10:
			class PlaceholderBlot10 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			PlaceholderBlot10.className = `placeholderClass${index}`;
			PlaceholderBlot10.blotName = `placeholder${index}`;
			PlaceholderBlot10.tagName = `placeholder${index}`;
			QuillNamespace.register(PlaceholderBlot10);
			class Date10 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Date10.className = `dateClass${index}`;
			Date10.blotName = `date${index}`;
			Date10.tagName = `date${index}`;
			QuillNamespace.register(Date10);
			class Fullname10 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Fullname10.className = `fullnameClass${index}`;
			Fullname10.blotName = `fullname${index}`;
			Fullname10.tagName = `fullname${index}`;
			QuillNamespace.register(Fullname10);
			class Email10 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Email10.className = `emailClass${index}`;
			Email10.blotName = `email${index}`;
			Email10.tagName = `email${index}`;
			QuillNamespace.register(Email10);
			class Sign10 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Sign10.className = `signClass${index}`;
			Sign10.blotName = `sign${index}`;
			Sign10.tagName = `sign${index}`;
			QuillNamespace.register(Sign10);
			class Initials10 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Initials10.className = `initialsClass${index}`;
			Initials10.blotName = `initials${index}`;
			Initials10.tagName = `initials${index}`;
			QuillNamespace.register(Initials10);
			break;
		case 11:
			class PlaceholderBlot11 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			PlaceholderBlot11.className = `placeholderClass${index}`;
			PlaceholderBlot11.blotName = `placeholder${index}`;
			PlaceholderBlot11.tagName = `placeholder${index}`;
			QuillNamespace.register(PlaceholderBlot11);
			class Date11 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Date11.className = `dateClass${index}`;
			Date11.blotName = `date${index}`;
			Date11.tagName = `date${index}`;
			QuillNamespace.register(Date11);
			class Fullname11 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Fullname11.className = `fullnameClass${index}`;
			Fullname11.blotName = `fullname${index}`;
			Fullname11.tagName = `fullname${index}`;
			QuillNamespace.register(Fullname11);
			class Email11 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Email11.className = `emailClass${index}`;
			Email11.blotName = `email${index}`;
			Email11.tagName = `email${index}`;
			QuillNamespace.register(Email11);
			class Sign11 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Sign11.className = `signClass${index}`;
			Sign11.blotName = `sign${index}`;
			Sign11.tagName = `sign${index}`;
			QuillNamespace.register(Sign11);
			class Initials11 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Initials11.className = `initialsClass${index}`;
			Initials11.blotName = `initials${index}`;
			Initials11.tagName = `initials${index}`;
			QuillNamespace.register(Initials11);
			break;
		case 12:
			class PlaceholderBlot12 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			PlaceholderBlot12.className = `placeholderClass${index}`;
			PlaceholderBlot12.blotName = `placeholder${index}`;
			PlaceholderBlot12.tagName = `placeholder${index}`;
			QuillNamespace.register(PlaceholderBlot12);
			class Date12 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Date12.className = `dateClass${index}`;
			Date12.blotName = `date${index}`;
			Date12.tagName = `date${index}`;
			QuillNamespace.register(Date12);
			class Fullname12 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Fullname12.className = `fullnameClass${index}`;
			Fullname12.blotName = `fullname${index}`;
			Fullname12.tagName = `fullname${index}`;
			QuillNamespace.register(Fullname12);
			class Email12 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Email12.className = `emailClass${index}`;
			Email12.blotName = `email${index}`;
			Email12.tagName = `email${index}`;
			QuillNamespace.register(Email12);
			class Sign12 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Sign12.className = `signClass${index}`;
			Sign12.blotName = `sign${index}`;
			Sign12.tagName = `sign${index}`;
			QuillNamespace.register(Sign12);
			class Initials12 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Initials12.className = `initialsClass${index}`;
			Initials12.blotName = `initials${index}`;
			Initials12.tagName = `initials${index}`;
			QuillNamespace.register(Initials12);
			break;
		case 13:
			class PlaceholderBlot13 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			PlaceholderBlot13.className = `placeholderClass${index}`;
			PlaceholderBlot13.blotName = `placeholder${index}`;
			PlaceholderBlot13.tagName = `placeholder${index}`;
			QuillNamespace.register(PlaceholderBlot13);
			class Date13 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Date13.className = `dateClass${index}`;
			Date13.blotName = `date${index}`;
			Date13.tagName = `date${index}`;
			QuillNamespace.register(Date13);
			class Fullname13 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Fullname13.className = `fullnameClass${index}`;
			Fullname13.blotName = `fullname${index}`;
			Fullname13.tagName = `fullname${index}`;
			QuillNamespace.register(Fullname13);
			class Email13 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Email13.className = `emailClass${index}`;
			Email13.blotName = `email${index}`;
			Email13.tagName = `email${index}`;
			QuillNamespace.register(Email13);
			class Sign13 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Sign13.className = `signClass${index}`;
			Sign13.blotName = `sign${index}`;
			Sign13.tagName = `sign${index}`;
			QuillNamespace.register(Sign13);
			class Initials13 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Initials13.className = `initialsClass${index}`;
			Initials13.blotName = `initials${index}`;
			Initials13.tagName = `initials${index}`;
			QuillNamespace.register(Initials13);
			break;
		case 14:
			class PlaceholderBlot14 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			PlaceholderBlot14.className = `placeholderClass${index}`;
			PlaceholderBlot14.blotName = `placeholder${index}`;
			PlaceholderBlot14.tagName = `placeholder${index}`;
			QuillNamespace.register(PlaceholderBlot14);
			class Date14 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Date14.className = `dateClass${index}`;
			Date14.blotName = `date${index}`;
			Date14.tagName = `date${index}`;
			QuillNamespace.register(Date14);
			class Fullname14 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Fullname14.className = `fullnameClass${index}`;
			Fullname14.blotName = `fullname${index}`;
			Fullname14.tagName = `fullname${index}`;
			QuillNamespace.register(Fullname14);
			class Email14 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Email14.className = `emailClass${index}`;
			Email14.blotName = `email${index}`;
			Email14.tagName = `email${index}`;
			QuillNamespace.register(Email14);
			class Sign14 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Sign14.className = `signClass${index}`;
			Sign14.blotName = `sign${index}`;
			Sign14.tagName = `sign${index}`;
			QuillNamespace.register(Sign14);
			class Initials14 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Initials14.className = `initialsClass${index}`;
			Initials14.blotName = `initials${index}`;
			Initials14.tagName = `initials${index}`;
			QuillNamespace.register(Initials14);
			break;
		case 15:
			class PlaceholderBlot15 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			PlaceholderBlot15.className = `placeholderClass${index}`;
			PlaceholderBlot15.blotName = `placeholder${index}`;
			PlaceholderBlot15.tagName = `placeholder${index}`;
			QuillNamespace.register(PlaceholderBlot15);
			class Date15 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Date15.className = `dateClass${index}`;
			Date15.blotName = `date${index}`;
			Date15.tagName = `date${index}`;
			QuillNamespace.register(Date15);
			class Fullname15 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Fullname15.className = `fullnameClass${index}`;
			Fullname15.blotName = `fullname${index}`;
			Fullname15.tagName = `fullname${index}`;
			QuillNamespace.register(Fullname15);
			class Email15 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Email15.className = `emailClass${index}`;
			Email15.blotName = `email${index}`;
			Email15.tagName = `email${index}`;
			QuillNamespace.register(Email15);
			class Sign15 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Sign15.className = `signClass${index}`;
			Sign15.blotName = `sign${index}`;
			Sign15.tagName = `sign${index}`;
			QuillNamespace.register(Sign15);
			class Initials15 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Initials15.className = `initialsClass${index}`;
			Initials15.blotName = `initials${index}`;
			Initials15.tagName = `initials${index}`;
			QuillNamespace.register(Initials15);
			break;
		case 16:
			class PlaceholderBlot16 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			PlaceholderBlot16.className = `placeholderClass${index}`;
			PlaceholderBlot16.blotName = `placeholder${index}`;
			PlaceholderBlot16.tagName = `placeholder${index}`;
			QuillNamespace.register(PlaceholderBlot16);
			class Date16 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Date16.className = `dateClass${index}`;
			Date16.blotName = `date${index}`;
			Date16.tagName = `date${index}`;
			QuillNamespace.register(Date16);
			class Fullname16 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Fullname16.className = `fullnameClass${index}`;
			Fullname16.blotName = `fullname${index}`;
			Fullname16.tagName = `fullname${index}`;
			QuillNamespace.register(Fullname16);
			class Email16 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Email16.className = `emailClass${index}`;
			Email16.blotName = `email${index}`;
			Email16.tagName = `email${index}`;
			QuillNamespace.register(Email16);
			class Sign16 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Sign16.className = `signClass${index}`;
			Sign16.blotName = `sign${index}`;
			Sign16.tagName = `sign${index}`;
			QuillNamespace.register(Sign16);
			class Initials16 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Initials16.className = `initialsClass${index}`;
			Initials16.blotName = `initials${index}`;
			Initials16.tagName = `initials${index}`;
			QuillNamespace.register(Initials16);
			break;
		case 17:
			class PlaceholderBlot17 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			PlaceholderBlot17.className = `placeholderClass${index}`;
			PlaceholderBlot17.blotName = `placeholder${index}`;
			PlaceholderBlot17.tagName = `placeholder${index}`;
			QuillNamespace.register(PlaceholderBlot17);
			class Date17 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Date17.className = `dateClass${index}`;
			Date17.blotName = `date${index}`;
			Date17.tagName = `date${index}`;
			QuillNamespace.register(Date17);
			class Fullname17 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Fullname17.className = `fullnameClass${index}`;
			Fullname17.blotName = `fullname${index}`;
			Fullname17.tagName = `fullname${index}`;
			QuillNamespace.register(Fullname17);
			class Email17 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Email17.className = `emailClass${index}`;
			Email17.blotName = `email${index}`;
			Email17.tagName = `email${index}`;
			QuillNamespace.register(Email17);
			class Sign17 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Sign17.className = `signClass${index}`;
			Sign17.blotName = `sign${index}`;
			Sign17.tagName = `sign${index}`;
			QuillNamespace.register(Sign17);
			class Initials17 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Initials17.className = `initialsClass${index}`;
			Initials17.blotName = `initials${index}`;
			Initials17.tagName = `initials${index}`;
			QuillNamespace.register(Initials17);
			break;
		case 18:
			class PlaceholderBlot18 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			PlaceholderBlot18.className = `placeholderClass${index}`;
			PlaceholderBlot18.blotName = `placeholder${index}`;
			PlaceholderBlot18.tagName = `placeholder${index}`;
			QuillNamespace.register(PlaceholderBlot18);
			class Date18 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Date18.className = `dateClass${index}`;
			Date18.blotName = `date${index}`;
			Date18.tagName = `date${index}`;
			QuillNamespace.register(Date18);
			class Fullname18 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Fullname18.className = `fullnameClass${index}`;
			Fullname18.blotName = `fullname${index}`;
			Fullname18.tagName = `fullname${index}`;
			QuillNamespace.register(Fullname18);
			class Email18 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Email18.className = `emailClass${index}`;
			Email18.blotName = `email${index}`;
			Email18.tagName = `email${index}`;
			QuillNamespace.register(Email18);
			class Sign18 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Sign18.className = `signClass${index}`;
			Sign18.blotName = `sign${index}`;
			Sign18.tagName = `sign${index}`;
			QuillNamespace.register(Sign18);
			class Initials18 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Initials18.className = `initialsClass${index}`;
			Initials18.blotName = `initials${index}`;
			Initials18.tagName = `initials${index}`;
			QuillNamespace.register(Initials18);
			break;
		case 19:
			class PlaceholderBlot19 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			PlaceholderBlot19.className = `placeholderClass${index}`;
			PlaceholderBlot19.blotName = `placeholder${index}`;
			PlaceholderBlot19.tagName = `placeholder${index}`;
			QuillNamespace.register(PlaceholderBlot19);
			class Date19 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Date19.className = `dateClass${index}`;
			Date19.blotName = `date${index}`;
			Date19.tagName = `date${index}`;
			QuillNamespace.register(Date19);
			class Fullname19 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Fullname19.className = `fullnameClass${index}`;
			Fullname19.blotName = `fullname${index}`;
			Fullname19.tagName = `fullname${index}`;
			QuillNamespace.register(Fullname19);
			class Email19 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Email19.className = `emailClass${index}`;
			Email19.blotName = `email${index}`;
			Email19.tagName = `email${index}`;
			QuillNamespace.register(Email19);
			class Sign19 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Sign19.className = `signClass${index}`;
			Sign19.blotName = `sign${index}`;
			Sign19.tagName = `sign${index}`;
			QuillNamespace.register(Sign19);
			class Initials19 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Initials19.className = `initialsClass${index}`;
			Initials19.blotName = `initials${index}`;
			Initials19.tagName = `initials${index}`;
			QuillNamespace.register(Initials19);
			break;
		case 20:
			class PlaceholderBlot20 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			PlaceholderBlot20.className = `placeholderClass${index}`;
			PlaceholderBlot20.blotName = `placeholder${index}`;
			PlaceholderBlot20.tagName = `placeholder${index}`;
			QuillNamespace.register(PlaceholderBlot20);
			class Date20 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Date20.className = `dateClass${index}`;
			Date20.blotName = `date${index}`;
			Date20.tagName = `date${index}`;
			QuillNamespace.register(Date20);
			class Fullname20 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Fullname20.className = `fullnameClass${index}`;
			Fullname20.blotName = `fullname${index}`;
			Fullname20.tagName = `fullname${index}`;
			QuillNamespace.register(Fullname20);
			class Email20 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Email20.className = `emailClass${index}`;
			Email20.blotName = `email${index}`;
			Email20.tagName = `email${index}`;
			QuillNamespace.register(Email20);
			class Sign20 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Sign20.className = `signClass${index}`;
			Sign20.blotName = `sign${index}`;
			Sign20.tagName = `sign${index}`;
			QuillNamespace.register(Sign20);
			class Initials20 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			Initials20.className = `initialsClass${index}`;
			Initials20.blotName = `initials${index}`;
			Initials20.tagName = `initials${index}`;
			QuillNamespace.register(Initials20);
			break;
		case 21:
			class PlaceholderBlot21 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			PlaceholderBlot21.className = `placeholderClass${index}`;
			PlaceholderBlot21.blotName = `placeholder${index}`;
			PlaceholderBlot21.tagName = `placeholder${index}`;
			QuillNamespace.register(PlaceholderBlot21);
			break;
		case 22:
			class PlaceholderBlot22 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			PlaceholderBlot22.className = `placeholderClass${index}`;
			PlaceholderBlot22.blotName = `placeholder${index}`;
			PlaceholderBlot22.tagName = `placeholder${index}`;
			QuillNamespace.register(PlaceholderBlot22);
			break;
		case 23:
			class PlaceholderBlot23 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			PlaceholderBlot23.className = `placeholderClass${index}`;
			PlaceholderBlot23.blotName = `placeholder${index}`;
			PlaceholderBlot23.tagName = `placeholder${index}`;
			QuillNamespace.register(PlaceholderBlot23);
			break;
		case 24:
			class PlaceholderBlot24 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			PlaceholderBlot24.className = `placeholderClass${index}`;
			PlaceholderBlot24.blotName = `placeholder${index}`;
			PlaceholderBlot24.tagName = `placeholder${index}`;
			QuillNamespace.register(PlaceholderBlot24);
			break;
		case 25:
			class PlaceholderBlot25 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			PlaceholderBlot25.className = `placeholderClass${index}`;
			PlaceholderBlot25.blotName = `placeholder${index}`;
			PlaceholderBlot25.tagName = `placeholder${index}`;
			QuillNamespace.register(PlaceholderBlot25);
			break;
		case 26:
			class PlaceholderBlot26 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			PlaceholderBlot26.className = `placeholderClass${index}`;
			PlaceholderBlot26.blotName = `placeholder${index}`;
			PlaceholderBlot26.tagName = `placeholder${index}`;
			QuillNamespace.register(PlaceholderBlot26);
			break;
		case 27:
			class PlaceholderBlot27 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			PlaceholderBlot27.className = `placeholderClass${index}`;
			PlaceholderBlot27.blotName = `placeholder${index}`;
			PlaceholderBlot27.tagName = `placeholder${index}`;
			QuillNamespace.register(PlaceholderBlot27);
			break;
		case 28:
			class PlaceholderBlot28 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			PlaceholderBlot28.className = `placeholderClass${index}`;
			PlaceholderBlot28.blotName = `placeholder${index}`;
			PlaceholderBlot28.tagName = `placeholder${index}`;
			QuillNamespace.register(PlaceholderBlot28);
			break;
		case 29:
			class PlaceholderBlot29 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			PlaceholderBlot29.className = `placeholderClass${index}`;
			PlaceholderBlot29.blotName = `placeholder${index}`;
			PlaceholderBlot29.tagName = `placeholder${index}`;
			QuillNamespace.register(PlaceholderBlot29);
			break;
		case 30:
			class PlaceholderBlot30 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			PlaceholderBlot30.className = `placeholderClass${index}`;
			PlaceholderBlot30.blotName = `placeholder${index}`;
			PlaceholderBlot30.tagName = `placeholder${index}`;
			QuillNamespace.register(PlaceholderBlot30);
			break;
		case 31:
			class PlaceholderBlot31 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			PlaceholderBlot31.className = `placeholderClass${index}`;
			PlaceholderBlot31.blotName = `placeholder${index}`;
			PlaceholderBlot31.tagName = `placeholder${index}`;
			QuillNamespace.register(PlaceholderBlot31);
			break;
		case 32:
			class PlaceholderBlot32 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			PlaceholderBlot32.className = `placeholderClass${index}`;
			PlaceholderBlot32.blotName = `placeholder${index}`;
			PlaceholderBlot32.tagName = `placeholder${index}`;
			QuillNamespace.register(PlaceholderBlot32);
			break;
		case 33:
			class PlaceholderBlot33 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			PlaceholderBlot33.className = `placeholderClass${index}`;
			PlaceholderBlot33.blotName = `placeholder${index}`;
			PlaceholderBlot33.tagName = `placeholder${index}`;
			QuillNamespace.register(PlaceholderBlot33);
			break;
		case 34:
			class PlaceholderBlot34 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			PlaceholderBlot34.className = `placeholderClass${index}`;
			PlaceholderBlot34.blotName = `placeholder${index}`;
			PlaceholderBlot34.tagName = `placeholder${index}`;
			QuillNamespace.register(PlaceholderBlot34);
			break;
		case 35:
			class PlaceholderBlot35 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			PlaceholderBlot35.className = `placeholderClass${index}`;
			PlaceholderBlot35.blotName = `placeholder${index}`;
			PlaceholderBlot35.tagName = `placeholder${index}`;
			QuillNamespace.register(PlaceholderBlot35);
			break;
		case 36:
			class PlaceholderBlot36 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			PlaceholderBlot36.className = `placeholderClass${index}`;
			PlaceholderBlot36.blotName = `placeholder${index}`;
			PlaceholderBlot36.tagName = `placeholder${index}`;
			QuillNamespace.register(PlaceholderBlot36);
			break;
		case 37:
			class PlaceholderBlot37 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			PlaceholderBlot37.className = `placeholderClass${index}`;
			PlaceholderBlot37.blotName = `placeholder${index}`;
			PlaceholderBlot37.tagName = `placeholder${index}`;
			QuillNamespace.register(PlaceholderBlot37);
			break;
		case 38:
			class PlaceholderBlot38 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			PlaceholderBlot38.className = `placeholderClass${index}`;
			PlaceholderBlot38.blotName = `placeholder${index}`;
			PlaceholderBlot38.tagName = `placeholder${index}`;
			QuillNamespace.register(PlaceholderBlot38);
			break;
		case 39:
			class PlaceholderBlot39 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			PlaceholderBlot39.className = `placeholderClass${index}`;
			PlaceholderBlot39.blotName = `placeholder${index}`;
			PlaceholderBlot39.tagName = `placeholder${index}`;
			QuillNamespace.register(PlaceholderBlot39);
			break;
		case 40:
			class PlaceholderBlot40 extends Inline {
				static create() {
					const node = super.create();
					node.setAttribute('contenteditable', 'false');

					return node;
				}
			}
			PlaceholderBlot40.className = `placeholderClass${index}`;
			PlaceholderBlot40.blotName = `placeholder${index}`;
			PlaceholderBlot40.tagName = `placeholder${index}`;
			QuillNamespace.register(PlaceholderBlot40);
			break;
	}
};
export const snapToGrid = (x: number, y: number): [number, number] => {
	const snappedX = Math.round(x / 32) * 32;
	const snappedY = Math.round(y / 32) * 32;
	return [snappedX, snappedY];
};
export const delColorFromHtml = (value: string) => {
	let textTmp = value;
	// return value;
	let tag = `<span style="`;
	let array = textTmp?.split(tag);
	let resultText = '';
	if (array) {
		for (let i = 0; i < array.length; i++) {
			if (array.length > 1) {
				if (i === 0) {
					resultText += array[i];
				} else {
					resultText += `<span style="`;
					let lineArr: string[] = [];
					for (let k = 0; k <= 5; k++) {
						switch (k) {
							case 0:
								tag = `;"><placeholder`;
								break;
							case 1:
								tag = `;"><date`;
								break;
							case 2:
								tag = `;"><fullname`;
								break;
							case 3:
								tag = `;"><email`;
								break;
							case 4:
								tag = `;"><sign`;
								break;
							case 5:
								tag = `;"><initials`;
								break;
						}
						lineArr = array[i].split(tag);
						if (lineArr.length === 2) {
							break;
						}
					}
					if (lineArr.length === 2) {
						for (let j = 0; j < lineArr.length; j++) {
							if (j === 0) {
								resultText += tag;
							} else {
								resultText += lineArr[j];
							}
						}
					} else {
						resultText += array[i];
					}
				}
			} else {
				resultText = array[i];
			}
		}
		textTmp = resultText;
	}
	let count = 0;
	for (let tagId = 0; tagId < 5; tagId++) {
		switch (tagId) {
			case 0:
				tag = `placeholder`;
				count = 40;
				break;
			case 1:
				tag = `date`;
				count = 20;
				break;
			case 2:
				tag = `fullname`;
				count = 20;
				break;
			case 3:
				tag = `email`;
				count = 20;
				break;
			case 4:
				tag = `sign`;
				count = 20;
				break;
		}
		for (let id = 1; id <= count; id++) {
			let tagFind = `<${tag}${id} class=`;
			array = textTmp?.split(tagFind);
			resultText = '';
			if (array) {
				for (let i = 0; i < array.length; i++) {
					if (array.length > 1) {
						if (i === 0) {
							resultText += array[i];
						} else {
							resultText += `<${tag}${id} class=`;
							tagFind = `</${tag}${id}>`;
							const lineArr = array[i].split(tagFind);
							for (let j = 0; j < lineArr.length; j++) {
								if (j === 0) {
									tagFind = `"${tag}Class${id}" contenteditable="false"`;
									const elArray = lineArr[j].split(tagFind);
									for (let k = 0; k < elArray.length; k++) {
										if (k === 0) {
											resultText += `${elArray[k]}${tagFind}>`;
										} else {
											let valueTmp = elArray[k].split('>');
											resultText += `${valueTmp[1]}</${tag}${id}>`;
										}
									}
								} else {
									resultText += lineArr[j];
								}
							}
						}
					} else {
						resultText = array[i];
					}
				}
				textTmp = resultText;
			}
		}
	}

	return textTmp;
};
export const addActualColors = (value: string, placeholders: Placeholder[]) => {
	let textTmp = value;
	for (let i = 0; i < placeholders.length; i++) {
		if (placeholders[i].isSpecial) {
			if (placeholders[i].specialType) {
				let tag = '';
				switch (placeholders[i].specialType) {
					case SpecialType.DATE:
						tag = Tags.DATE;
						break;
					case SpecialType.FULLNAME:
						tag = Tags.FULLNAME;
						break;
					case SpecialType.EMAIL:
						tag = Tags.EMAIL;
						break;
					case SpecialType.SIGN:
						tag = Tags.SIGN;
						break;
					case SpecialType.INITIALS:
						tag = Tags.INITIALS;
						break;
				}
				textTmp = changeColorInTag(
					tag,
					placeholders[i].id ? (placeholders[i].id as number) : 0,
					textTmp,
					placeholders[i].color as string
				);
			}
		} else {
			textTmp = changeColorInTag(
				Tags.PLACEHOLDER,
				placeholders[i].id ? (placeholders[i].id as number) : 0,
				textTmp,
				placeholders[i].color as string
			);
		}
	}
	return textTmp;
};
export const changeColorInTag = (
	tagFind: string,
	id: number,
	text: string,
	color: string
) => {
	let textTmp = text;
	let tag = `<${tagFind}${id} class=`;
	let array = textTmp?.split(tag);
	let resultText = '';
	if (array) {
		for (let i = 0; i < array.length; i++) {
			if (array.length > 1) {
				if (i === 0) {
					resultText += array[i];
				} else {
					resultText += `<${tagFind}${id} class=`;
					tag = `</${tagFind}${id}>`;
					const lineArr = array[i].split(tag);
					for (let j = 0; j < lineArr.length; j++) {
						if (j === 0) {
							tag = `"${tagFind}Class${id}" contenteditable="false"`;
							const elArray = lineArr[j].split(tag);
							for (let k = 0; k < elArray.length; k++) {
								if (k === 0) {
									resultText += `${elArray[k]}"${tagFind}Class${id}" contenteditable="false" style="background-color:${color};"`;
								} else {
									resultText += `${elArray[k]}</${tagFind}${id}>`;
								}
							}
						} else {
							resultText += lineArr[j];
						}
					}
				}
			} else {
				resultText = array[i];
			}
		}
		textTmp = resultText;
	}
	return textTmp;
};
export const changeValueInTag = (
	tagName: string,
	id: number,
	value: string,
	color: string,
	text: string
) => {
	let textTmp = text;
	let contenteditable = false;
	if (textTmp?.includes('contenteditable')) {
		contenteditable = true;
	}
	let tag = `<${tagName}${id} class=`;
	let array = textTmp?.split(tag);
	let resultText = '';
	// debugger;
	if (array) {
		for (let i = 0; i < array.length; i++) {
			if (array.length > 1) {
				if (i === 0) {
					resultText += array[i];
				} else {
					resultText += `<${tagName}${id} class=`;
					tag = `</${tagName}${id}>`;
					const lineArr = array[i].split(tag);
					for (let j = 0; j < lineArr.length; j++) {
						if (j === 0) {
							tag = contenteditable
								? `"${tagName}Class${id}" contenteditable="false"`
								: `"${tagName}Class${id}"`;
							const elArray = lineArr[j].split(tag);
							for (let k = 0; k < elArray.length; k++) {
								if (k === 0) {
									resultText += contenteditable
										? `${elArray[k]}"${tagName}Class${id}" contenteditable="false" style="background-color:${color};">`
										: `${elArray[k]}"${tagName}Class${id}" style="background-color:${color};">`;
								} else {
									resultText += `${value}</${tagName}${id}>`;
								}
							}
						} else {
							resultText += lineArr[j];
						}
					}
				}
			} else {
				resultText = array[i];
			}
		}
		textTmp = resultText;
	}
	return textTmp;
};
export const getIcon = (placeholder: Placeholder) => {
	if (
		placeholder.view?.toString() === PlaceholderView.SIGNATURE.toString() ||
		(placeholder.specialType &&
			placeholder.specialType?.toString() === SpecialType.SIGN.toString())
	) {
		return faSignature;
	}

	if (
		placeholder.specialType &&
		placeholder.specialType?.toString() === SpecialType.DATE.toString()
	) {
		return faCalendarDays;
	}

	if (
		placeholder.specialType &&
		placeholder.specialType?.toString() === SpecialType.FULLNAME.toString()
	) {
		return faUser;
	}

	if (
		placeholder.specialType &&
		placeholder.specialType?.toString() === SpecialType.EMAIL.toString()
	) {
		return faAt;
	}

	return faFont;
};
export const removeAilineTags = (html: string) => {
	const parser = new DOMParser();
	const doc = parser.parseFromString(html, 'text/html');
	const ailineElements = doc.querySelectorAll('ailine');
	ailineElements.forEach((element) => {
		const parent = element.parentNode;
		if (parent) {
			const textNode = document.createTextNode(element.textContent || '');
			parent.replaceChild(textNode, element);
		}
	});
	return doc.body.innerHTML;
};
// Обновленная функция wrapTextNodes
export const wrapTextNodes = (html: string) => {
	const parser = new DOMParser();
	const doc = parser.parseFromString(html, 'text/html');
	let valueCounter = 1;
	// debugger;
	const traverseNodes = (node: Node) => {
		if (node.nodeType === Node.TEXT_NODE) {
			const textContent = node.textContent;
			if (
				textContent &&
				!textContent.startsWith('{{{') &&
				!textContent.endsWith('}}}') &&
				!node.parentNode?.nodeName.toLowerCase().startsWith('placeholder') &&
				!node.parentNode?.nodeName.toLowerCase().startsWith('sign') &&
				!node.parentNode?.nodeName.toLowerCase().startsWith('fullname') &&
				!node.parentNode?.nodeName.toLowerCase().startsWith('date') &&
				!node.parentNode?.nodeName.toLowerCase().startsWith('email')
			) {
				const wrappedNode = doc.createElement('ailine');
				wrappedNode.setAttribute('value', valueCounter.toString());
				wrappedNode.style.whiteSpace = 'pre-wrap';
				wrappedNode.innerHTML =
					textContent
						?.replace(/ /g, '&nbsp;')
						.replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;') || '';
				node.parentNode?.replaceChild(wrappedNode, node);
				valueCounter++;
			}
		} else {
			node.childNodes.forEach(traverseNodes);
		}
	};

	traverseNodes(doc.body);
	return doc.body.innerHTML;
};
