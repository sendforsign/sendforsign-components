import React, { useEffect, useRef } from 'react';
import { Space, Row, Col, Button, Spin, Tooltip } from 'antd';

import { useAiAssistantContext } from '../ai-assistant-context';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookBookmark, faPlus } from '@fortawesome/free-solid-svg-icons';
import { Context } from '../../../config/types';

export const ContextList = () => {
	const { setContextModal, contexts, spinContextLoad, setSpinContextLoad } =
		useAiAssistantContext();
	const currContexts = useRef<Context[]>([]);

	useEffect(() => {
		currContexts.current = contexts;
		setSpinContextLoad(false);
	}, [contexts]);

	const handleCreateContext = () => {
		setContextModal(true);
	};
	const handleContextChoose = (contextKey: string) => {};
	return (
		<div>
			{spinContextLoad ? (
				<Spin
					spinning={spinContextLoad}
					style={{ display: 'flex', justifyContent: 'center' }}
				/>
			) : (
				<Row gutter={16} style={{ marginBottom: 32 }} wrap={false}>
					<Col flex={'auto'} />
					<Col
						flex={'auto'}
						style={{ display: 'flex', justifyContent: 'center' }}
					>
						<Space
							style={{
								minWidth: 100,
								maxWidth: 800,
								justifyContent: 'center',
							}}
							wrap
							align='center'
						>
							{/* <Button
								icon={<FontAwesomeIcon color='green' icon={faBookBookmark} />}
								shape='round'
							>
								Гражданское право
							</Button>
							<Button
								icon={<FontAwesomeIcon color='orange' icon={faBookBookmark} />}
								shape='round'
							>
								Уголовный кодекс
							</Button>
							<Button
								icon={<FontAwesomeIcon color='orange' icon={faBookBookmark} />}
								shape='round'
							>
								Трудовой кодекс
							</Button> */}
							{currContexts.current &&
								currContexts.current.length > 0 &&
								currContexts.current.map((context) => {
									return (
										<Button
											id={context.contextKey}
											icon={
												<FontAwesomeIcon
													color={context.general ? '#088F8F' : 'red'}
													icon={faBookBookmark}
												/>
											}
											shape='round'
											onClick={() => {
												handleContextChoose(context.contextKey as string);
											}}
										>
											{context.name}
										</Button>
									);
								})}
							<Tooltip title='Upload files to add your own context'>
								<Button
									icon={<FontAwesomeIcon color='grey' icon={faPlus} />}
									shape='round'
									type='dashed'
									// loading={createContextLoad}
									onClick={handleCreateContext}
								/>
							</Tooltip>
						</Space>
					</Col>
					<Col flex={'auto'} />
				</Row>
			)}
		</div>
	);
};
