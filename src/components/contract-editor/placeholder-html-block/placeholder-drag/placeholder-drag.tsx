import React, { useRef, useEffect } from 'react';
import {
	Space,
	Typography,
	Button,
	Input,
	Radio,
	Row,
	Tooltip,
	Col,
	Popover,
	Divider,
} from 'antd';
import { useContractEditorContext } from '../../contract-editor-context';
import {
	PlaceholderFill,
	PlaceholderView,
} from '../../../../config/enum';
import { Placeholder, Recipient } from '../../../../config/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	faCircleQuestion,
	faCopy,
	faGear,
} from '@fortawesome/free-solid-svg-icons';
import { useDrag } from 'react-dnd';
import { getIcon } from '../../../../utils';

type Props = {
	style?: any;
	readonly?: boolean;
	placeholder: Placeholder;
	recipients?: Recipient[];
	onChange?: (data: any) => void;
	onChangeFilling?: (data: any) => void;
	onDelete?: () => void;
	onInsert?: (data: any) => void;
	onBlur?: (data: any) => void;
	onEnter?: () => void;
};

export const PlaceholderDrag = ({
	style,
	readonly,
	placeholder,
	recipients,
	onChange,
	onChangeFilling,
	onDelete,
	onInsert,
	onBlur,
	onEnter
}: Props) => {
	const currPlaceholder = useRef<Placeholder>(placeholder);
	const {
		setPlaceholderHtml,
	} = useContractEditorContext();

	const { Text } = Typography;
	const [, drag] = useDrag(
		() => ({
			type: `chosePlaceholder`,
			item: { chosePlaceholder: currPlaceholder.current },
			collect: (monitor) => ({
				isDragging: !!monitor.isDragging(),
				canDrag: !readonly,
			}),
		}),
		[currPlaceholder.current]
	);

	useEffect(() => {
		currPlaceholder.current = placeholder;
	}, [placeholder]);

	return (
		<div
			id={`placeholder${currPlaceholder.current.placeholderKey?.replaceAll(
				'-',
				'_'
			)}`}
			ref={!readonly ? drag : undefined}
			onDragStart={(e) => {
				e.dataTransfer.setData(
					'placeholderKey',
					currPlaceholder.current.placeholderKey as string
				);
				setPlaceholderHtml(currPlaceholder.current)
			}}
			style={style}
			role={'PlaceholderBlock'}
		>
			<Space
				className='ph-style'
				direction='vertical'
				size={2}
				style={style ? style : { display: 'flex', marginBottom: '16px' }}
			>
				<Row wrap={false} align={'middle'}>
					<Col>
						<Tooltip title='Drop onto the document.'>
							<div>
								<Button
									size='small'
									type='text'
									style={{
										background: `${currPlaceholder.current.color}`,
										cursor: 'grab',
									}}
									disabled={readonly}
									icon={
										<FontAwesomeIcon
											icon={getIcon(currPlaceholder.current)}
											size='sm'
											onClick={() => {
												if (onInsert) {
													onInsert(currPlaceholder.current)
												};
											}}
										/>
									}
								/>
							</div>
						</Tooltip>
					</Col>
					<Col>
						<Input
							id='PlaceholderName'
							readOnly={
								currPlaceholder.current.view?.toString() !==
									PlaceholderView.SIGNATURE.toString() &&
									!currPlaceholder.current.isSpecial &&
									!readonly
									? false
									: true
							}
							placeholder='Enter placeholder name'
							value={currPlaceholder.current.name}
							variant='borderless'
							onChange={(e: any) => onChange?.(e)}
							onBlur={(e: any) => onBlur?.(e)}
						/>
					</Col>
					<Col flex={'auto'}></Col>
					{currPlaceholder.current.view?.toString() !==
						PlaceholderView.SIGNATURE.toString() &&
						!currPlaceholder.current.isSpecial ? (
						<Col flex='24px'>
							<Popover
								content={
									<Space direction='vertical' style={{ display: 'flex' }}>
										<Space>
											<Text type='secondary'>Who fills in this field:</Text>
											<Tooltip title='Set who fills in this field: a contract owner when creating a contract from this template or an external recipient when opening a contract.'>
												<div>
													<Button
														disabled={readonly}
														size='small'
														icon={
															<FontAwesomeIcon
																icon={faCircleQuestion}
																size='xs'
															/>
														}
														type='text'
													></Button>
												</div>
											</Tooltip>
										</Space>
										<Radio.Group
											size='small'
											value={
												currPlaceholder.current.fillingType &&
													currPlaceholder.current.fillingType.toString() !==
													PlaceholderFill.SPECIFIC.toString()
													? currPlaceholder.current.fillingType?.toString()
													: currPlaceholder.current.fillingType &&
														currPlaceholder.current.fillingType.toString() ===
														PlaceholderFill.SPECIFIC.toString() &&
														currPlaceholder.current.externalRecipientKey &&
														recipients &&
														recipients.length > 0
														? recipients.find((placeholderRecipient) =>
															placeholderRecipient.recipientKey?.includes(
																currPlaceholder.current
																	.externalRecipientKey as string
															)
														)?.recipientKey
														: '1'
											}
											onChange={(e: any) => onChangeFilling?.(e)}
										>
											<Space direction='vertical'>
												<Radio value={PlaceholderFill.NONE.toString()}>
													None
												</Radio>
												<Radio value={PlaceholderFill.CREATOR.toString()}>
													Contract owner
												</Radio>
												{recipients &&
													recipients.length > 0 &&
													recipients.map((placeholderRecipient) => {
														return (
															<Radio value={placeholderRecipient.recipientKey}>
																{placeholderRecipient.fullname}
															</Radio>
														);
													})}
											</Space>
										</Radio.Group>
										<Divider style={{ margin: 0 }} />
										<Button
											disabled={readonly}
											// loading={delLoad}
											block
											danger
											type='text'
											onClick={() => {
												onDelete?.();
											}}
										>
											Delete
										</Button>
										<Divider style={{ margin: 0 }} />
										<Popover content={
											<Space direction='vertical'>
												<Text type='secondary'>Placeholder Key: {currPlaceholder.current.placeholderKey}</Text>
												<Button size='small' icon={<FontAwesomeIcon icon={faCopy} size='sm' color='#5d5d5d' />} onClick={() => navigator.clipboard.writeText(currPlaceholder.current.placeholderKey || 'N/A')}>Copy</Button>
											</Space>
										} trigger="click">
											<Button size='small'>{currPlaceholder.current.placeholderKey}</Button>
										</Popover>
									</Space>
								}
								trigger='click'
							>
								<div>
									<Button
										disabled={readonly}
										size='small'
										type='text'
										icon={<FontAwesomeIcon icon={faGear} size='xs' />}
									/>
								</div>
							</Popover>
						</Col>
					) : (
						<Col flex='24px'>
							<Popover
								content={
									<Space direction='vertical' style={{ display: 'flex' }}>
										<Popover content={
											<Space direction='vertical'>
												<Text type='secondary'>Placeholder Key: {currPlaceholder.current.placeholderKey}</Text>
												<Button size='small' icon={<FontAwesomeIcon icon={faCopy} size='sm' color='#5d5d5d' />} onClick={() => navigator.clipboard.writeText(currPlaceholder.current.placeholderKey || 'N/A')}>Copy</Button>
											</Space>
										} trigger="click">
											<Button size='small'>{currPlaceholder.current.placeholderKey}</Button>
										</Popover>
									</Space>
								}
								trigger='click'
							>
								<div>
									<Button
										disabled={readonly}
										size='small'
										type='text'
										icon={<FontAwesomeIcon icon={faGear} size='xs' />}
									/>
								</div>
							</Popover>
						</Col>
					)}
				</Row>
				{currPlaceholder.current.view?.toString() !==
					PlaceholderView.SIGNATURE.toString() &&
					!currPlaceholder.current.isSpecial &&
					!currPlaceholder.current.isTable && (
						<Input
							id='PlaceholderValue'
							placeholder='Enter value'
							readOnly={readonly}
							value={currPlaceholder.current.value}
							onChange={(e: any) => onChange?.(e)}
							onBlur={(e: any) => onBlur?.(e)}
							onPressEnter={() => onEnter?.()}
						/>
					)}
			</Space>
		</div>
	);
};
