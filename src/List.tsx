import React from 'react';
import { sortBy } from 'lodash';

const SORTS: { [key: string]: (list: Stories) => Stories } = {
	NONE: (list: Stories) => list,
	TITLE: (list: Stories) => sortBy(list, 'title'),
	AUTHOR: (list: Stories) => sortBy(list, 'author'),
	COMMENT: (list: Stories) => sortBy(list, 'num_comments').reverse(),
	POINT: (list: Stories) => sortBy(list, 'points').reverse(),
};

interface Story {
	objectID: string;
	url: string;
	title: string;
	author: string;
	num_comments: number;
	points: number;
}
type Stories = Array<Story>;

interface ListProps {
	list: Stories;
	onRemoveItem: (item: Story) => void;
}

const List = ({ list, onRemoveItem }: ListProps) => {
	const [sort, setSort] = React.useState({
		sortKey: 'NONE',
		isReverse: false,
	});

	const handleSort = (sortKey: string) => {
		const isReverse = sort.sortKey === sortKey && !sort.isReverse;
		setSort({ sortKey, isReverse });
	};

	const sortFunction = SORTS[sort.sortKey];

	const sortedList = sort.isReverse ? sortFunction(list).reverse() : sortFunction(list);

	return (
		<>
			<div>
				<span>
					<button type="button" onClick={() => handleSort('TITLE')}>
						Title
					</button>
				</span>
				<span>
					<button type="button" onClick={() => handleSort('AUTHOR')}>
						Author
					</button>
				</span>
				<span>
					<button type="button" onClick={() => handleSort('COMMENT')}>
						Comments
					</button>
				</span>
				<span>
					<button type="button" onClick={() => handleSort('POINT')}>
						Points
					</button>
				</span>
				<span>Actions</span>
			</div>
			{sortedList.map((item: any) => (
				<Item key={item.objectID} item={item} onRemoveItem={onRemoveItem} />
			))}
		</>
	);
};

interface ItemProps {
	item: Story;
	onRemoveItem: (item: Story) => void;
}

const Item = ({ item, onRemoveItem }: ItemProps) => (
	<div>
		<span>
			<a href={item.url}>{item.title}</a>
		</span>
		<span>{item.author}</span>
		<span>{item.num_comments}</span>
		<span>{item.points}</span>
		<span>
			<button type="button" onClick={() => onRemoveItem(item)}>
				Dismiss
			</button>
		</span>
	</div>
);

export default List;
