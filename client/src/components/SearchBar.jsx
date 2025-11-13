import React, { useState } from 'react';

export default function SearchBar({ onSearch }) {
  const [q, setQ] = useState('');
  const submit = e => { e.preventDefault(); onSearch(q); };
  return (
    <form onSubmit={submit} className="search">
      <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search recipes..." />
      <button>Search</button>
      <button type="button" onClick={() => { setQ(''); onSearch(''); }}>Clear</button>
    </form>
  );
}