// src/hooks/useFuseSearch.ts
// Fuzzy search wrapper around Fuse.js.
import { useState, useMemo } from 'react';
import Fuse, { type IFuseOptions } from 'fuse.js';

export function useFuseSearch<T>(data: T[], options: IFuseOptions<T>) {
  const [query, setQuery] = useState('');

  const fuse = useMemo(() => new Fuse(data, options), [data, options]);

  const results = useMemo(() => {
    if (!query.trim()) return data;
    return fuse.search(query).map((result) => result.item);
  }, [fuse, query, data]);

  return { results, query, setQuery };
}
