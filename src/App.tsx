import React from 'react';
import axios from 'axios';

import SearchForm from './SearchForm';
import List from './List';

const API_BASE = 'https://hn.algolia.com/api/v1';
const API_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page=';
const getUrl = (searchTerm: string, page: number) =>
	`${API_BASE}${API_SEARCH}?${PARAM_SEARCH}${searchTerm}}&${PARAM_PAGE}${page}`;

// careful: notice the ? in between

const useSemiPersistentState = (key: string, initialState: string): [string, (newValue: string) => void] => {
	const [value, setValue] = React.useState(localStorage.getItem(key) || initialState);

	React.useEffect(() => {
		localStorage.setItem(key, value);
	}, [value, key]);

	return [value, setValue];
};

type Story = {
	objectID: string;
	url: string;
	title: string;
	author: string;
	num_comments: number;
	points: number;
};

type Stories = { list: Array<Story>; page: number };

type StoriesState = {
	data: Stories;
	isLoading: boolean;
	isError: boolean;
};

interface StoriesFetchInitAction {
	type: 'STORIES_FETCH_INIT';
}

interface StoriesFetchSuccessAction {
	type: 'STORIES_FETCH_SUCCESS';
	payload: Stories;
}

interface StoriesFetchFailureAction {
	type: 'STORIES_FETCH_FAILURE';
}

interface StoriesRemoveAction {
	type: 'REMOVE_STORY';
	payload: Story;
}

type StoriesAction =
	| StoriesFetchInitAction
	| StoriesFetchSuccessAction
	| StoriesFetchFailureAction
	| StoriesRemoveAction;

const storiesReducer = (state: StoriesState, action: StoriesAction): StoriesState => {
	switch (action.type) {
		case 'STORIES_FETCH_INIT':
			return {
				...state,
				isLoading: true,
				isError: false,
			};
		case 'STORIES_FETCH_SUCCESS':
			return {
				...state,
				isLoading: false,
				isError: false,
				data: { list: action.payload.list, page: action.payload.page },
			};
		case 'STORIES_FETCH_FAILURE':
			return {
				...state,
				isLoading: false,
				isError: true,
			};
		case 'REMOVE_STORY':
			return {
				...state,
				data: { ...state.data, list: state.data.list.filter((story) => action.payload.objectID !== story.objectID) },
			};
		default:
			throw new Error();
	}
};

const extractSearchTerm = (url: string) =>
	url.substring(url.lastIndexOf('?') + 1, url.lastIndexOf('&')).replace(PARAM_SEARCH, '');
const getLastSearches = (urls: string[]) =>
	urls
		.reduce((result: any, url, index) => {
			const searchTerm = extractSearchTerm(url);
			if (index === 0) {
				return result.concat(searchTerm);
			}
			const previousSearchTerm = result[result.length - 1];
			if (searchTerm === previousSearchTerm) {
				return result;
			} else {
				return result.concat(searchTerm);
			}
		}, [])
		.slice(-6)
		.slice(0, -1)
		.map(extractSearchTerm);

const App = () => {
	const [searchTerm, setSearchTerm] = useSemiPersistentState('search', 'React');

	const [urls, setUrls] = React.useState([getUrl(searchTerm, 0)]);

	const [stories, dispatchStories] = React.useReducer(storiesReducer, {
		data: { list: [], page: 1 },
		isLoading: false,
		isError: false,
	});

	const handleFetchStories = React.useCallback(async () => {
		dispatchStories({ type: 'STORIES_FETCH_INIT' });

		try {
			const lastUrl = urls[urls.length - 1];
			const result = await axios.get(lastUrl);

			dispatchStories({
				type: 'STORIES_FETCH_SUCCESS',
				payload: {
					list: result.data.hits,
					page: result.data.page,
				},
			});
		} catch {
			dispatchStories({ type: 'STORIES_FETCH_FAILURE' });
		}
	}, [urls]);

	React.useEffect(() => {
		handleFetchStories();
	}, [handleFetchStories]);

	const handleRemoveStory = (item: Story) => {
		dispatchStories({
			type: 'REMOVE_STORY',
			payload: item,
		});
	};

	const handleSearchInput = (event: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(event.target.value);
	};

	const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		handleSearch(searchTerm, 0);
		event.preventDefault();
	};

	const handleLastSearch = (searchTerm: string) => {
		setSearchTerm(searchTerm);

		handleSearch(searchTerm, 0);
	};

	const handleSearch = (searchTerm: string, page: number) => {
		const url = getUrl(searchTerm, page);
		setUrls(urls.concat(url));
	};

	const handleMore = () => {
		const lastUrl = urls[urls.length - 1];
		const searchTerm = extractSearchTerm(lastUrl);
		handleSearch(searchTerm, stories.data.page + 1);
	};

	const lastSearches = getLastSearches(urls);
	return (
		<div>
			<h1>My Hacker Stories</h1>

			<SearchForm searchTerm={searchTerm} onSearchInput={handleSearchInput} onSearchSubmit={handleSearchSubmit} />
			<LastSearches lastSearches={lastSearches} onLastSearch={handleLastSearch} />

			<hr />

			{stories.isError && <p>Something went wrong ...</p>}

			{stories.isLoading ? <p>Loading ...</p> : <List list={stories.data.list} onRemoveItem={handleRemoveStory} />}

			<button type="button" onClick={handleMore}>
				More
			</button>
		</div>
	);
};

interface LastSearchesProps {
	lastSearches: string[];
	onLastSearch: (searchTerm: string) => void;
}

const LastSearches = ({ lastSearches, onLastSearch }: LastSearchesProps) => (
	<>
		{lastSearches.map((searchTerm, index) => (
			<button key={searchTerm + index} type="button" onClick={() => onLastSearch(searchTerm)}>
				{searchTerm}
			</button>
		))}
	</>
);

export default App;
