import { SpecialType, Tags } from '../config/enum';
import { Placeholder } from '../config/types';

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
					let lineArr: string | any[] = [];
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
export const addActualColors = (
	audit: boolean,
	shareLink: string,
	value: string,
	placeholders: Placeholder[]
) => {
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
					audit
						? '#ffffff'
						: placeholders[i].externalRecipientKey &&
						  placeholders[i].externalRecipientKey === shareLink
						? '#a3e8f6'
						: '#f0f0f0'
				);
			}
		} else {
			textTmp = changeColorInTag(
				Tags.PLACEHOLDER,
				placeholders[i].id ? (placeholders[i].id as number) : 0,
				textTmp,
				audit
					? '#ffffff'
					: placeholders[i].externalRecipientKey &&
					  placeholders[i].externalRecipientKey === shareLink
					? '#a3e8f6'
					: '#f0f0f0'
			);
		}
	}
	return textTmp;
};
export const changeValueInTag = (
	tagFind: string,
	id: number,
	value: string,
	text: string,
	color: string,
	placeholders: Placeholder[]
  ) => {
	let textTmp = text;
	let contenteditable = false;
  
	if (tagFind.includes('placeholder')) {
	  for (let i = 0; i < placeholders.length; i++) {
		const findTag = `"${tagFind}Class${placeholders[i].id}" contenteditable="false"`;
		if (textTmp.includes(findTag)) {
		  contenteditable = true;
		  break;
		}
	  }
	} else {
	  contenteditable = true;
	}
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
				tag = contenteditable
				  ? `"${tagFind}Class${id}" contenteditable="false"`
				  : `"${tagFind}Class${id}"`;
				const elArray = lineArr[j].split(tag);
				for (let k = 0; k < elArray.length; k++) {
				  if (k === 0) {
					resultText += contenteditable
					  ? `${elArray[k]}"${tagFind}Class${id}" contenteditable="false" style="background-color:${color};">`
					  : `${elArray[k]}"${tagFind}Class${id}" style="background-color:${color};">`;
				  } else {
					resultText += `${value}</${tagFind}${id}>`;
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
