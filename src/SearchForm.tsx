import React from 'react';

import InputWithLabel from './InputWithLabel';

interface SearchFormProps {
	searchTerm: string;
	onSearchInput: (event: React.ChangeEvent<HTMLInputElement>) => void;
	onSearchSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

const SearchForm = ({ searchTerm, onSearchInput, onSearchSubmit }: SearchFormProps) => (
	<form onSubmit={onSearchSubmit}>
		<InputWithLabel id="search" value={searchTerm} isFocused onInputChange={onSearchInput}>
			<strong>Search:</strong>
		</InputWithLabel>

		<button type="submit" disabled={!searchTerm}>
			Submit
		</button>
	</form>
);

export default SearchForm;
