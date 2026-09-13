import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, ChevronLeft, ChevronRight, Loader2, RefreshCw } from 'lucide-react';
import MovieCard from '../components/MovieCard';
import SkeletonCard from '../components/SkeletonCard';
import { fetchExploreMovies, fetchGenres } from '../services/api';

const categories = [
	{ value: 'popular', label: 'Popular' },
	{ value: 'trending', label: 'Trending' },
	{ value: 'top-rated', label: 'Top Rated' },
	{ value: 'now-playing', label: 'Now Playing' },
	{ value: 'upcoming', label: 'Upcoming' },
];

const sortOptions = [
	{ value: 'popularity.desc', label: 'Popularity' },
	{ value: 'vote_average.desc', label: 'Rating: High to Low' },
	{ value: 'vote_average.asc', label: 'Rating: Low to High' },
	{ value: 'primary_release_date.desc', label: 'Release Date: Newest' },
	{ value: 'primary_release_date.asc', label: 'Release Date: Oldest' },
];

const getInitialState = () => {
	const params = new URLSearchParams(window.location.search);
	const category = categories.some((item) => item.value === params.get('category'))
		? params.get('category')
		: 'popular';
	const sortBy = sortOptions.some((item) => item.value === params.get('sort'))
		? params.get('sort')
		: 'popularity.desc';
	const page = Math.max(1, Number.parseInt(params.get('page'), 10) || 1);

	return {
		category,
		genreId: params.get('genre') || '',
		sortBy,
		page,
	};
};

export default function Explore({ wishlist, onToggleWishlist, onSelectMovie }) {
	const initialState = getInitialState();
	const [category, setCategory] = useState(initialState.category);
	const [genreId, setGenreId] = useState(initialState.genreId);
	const [sortBy, setSortBy] = useState(initialState.sortBy);
	const [page, setPage] = useState(initialState.page);
	const [genres, setGenres] = useState([]);
	const [movies, setMovies] = useState([]);
	const [totalPages, setTotalPages] = useState(1);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [retryToken, setRetryToken] = useState(0);
	const requestId = useRef(0);

	useEffect(() => {
		let mounted = true;
		fetchGenres()
			.then((response) => {
				if (mounted) setGenres(response?.data || []);
			})
			.catch(() => {
				if (mounted) setError('Unable to load genres.');
			});

		return () => {
			mounted = false;
		};
	}, []);

	useEffect(() => {
		const params = new URLSearchParams({ category, sort: sortBy, page: String(page) });
		if (genreId) params.set('genre', genreId);
		window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`);
	}, [category, genreId, sortBy, page, retryToken]);

	useEffect(() => {
		const currentRequest = requestId.current + 1;
		requestId.current = currentRequest;
		setLoading(true);
		setError(null);

		const timer = window.setTimeout(async () => {
			try {
				const response = await fetchExploreMovies({ category, genreId, sortBy, page });
				if (requestId.current !== currentRequest) return;

				const data = response?.data || response || {};
				setMovies(data.results || []);
				setTotalPages(Math.min(data.totalPages || 1, 500));
			} catch (requestError) {
				if (requestId.current === currentRequest) {
					setMovies([]);
					setError('Unable to load Explore movies. Please try again.');
				}
			} finally {
				if (requestId.current === currentRequest) setLoading(false);
			}
		}, 180);

		return () => window.clearTimeout(timer);
	}, [category, genreId, sortBy, page]);

	const changeCategory = (nextCategory) => {
		setCategory(nextCategory);
		setPage(1);
	};

	const changeGenre = (event) => {
		setGenreId(event.target.value);
		setPage(1);
	};

	const changeSort = (event) => {
		setSortBy(event.target.value);
		setPage(1);
	};

	const isWishlisted = (movieId) => wishlist.some((item) => item.movieId === movieId);

	return (
		<section className="space-y-8">
			<div>
				<p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-indigo-400">Find your next favorite</p>
				<h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Explore Movies</h1>
				<p className="mt-2 max-w-2xl text-slate-400">Browse popular releases, timeless favorites, and what is coming next.</p>
			</div>

			<div className="space-y-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5">
				<div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar" role="tablist" aria-label="Movie categories">
					{categories.map((item) => (
						<button
							key={item.value}
							type="button"
							role="tab"
							aria-selected={category === item.value}
							onClick={() => changeCategory(item.value)}
							className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
								category === item.value
									? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950/30'
									: 'text-slate-400 hover:bg-slate-800 hover:text-white'
							}`}
						>
							{item.label}
						</button>
					))}
				</div>

				<div className="grid gap-3 sm:grid-cols-2 sm:max-w-xl">
					<label className="text-sm text-slate-400">
						<span className="mb-2 block font-medium text-slate-300">Genre</span>
						<select value={genreId} onChange={changeGenre} className="h-11 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 text-slate-200 focus:border-indigo-500 focus:outline-none">
							<option value="">All genres</option>
							{genres.map((genre) => <option key={genre.id} value={genre.id}>{genre.name}</option>)}
						</select>
					</label>
					<label className="text-sm text-slate-400">
						<span className="mb-2 block font-medium text-slate-300">Sort by</span>
						<select value={sortBy} onChange={changeSort} className="h-11 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 text-slate-200 focus:border-indigo-500 focus:outline-none">
							{sortOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
						</select>
					</label>
				</div>
			</div>

			{error && (
				<div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-rose-900/70 bg-rose-950/30 p-4 text-rose-300">
					<div className="flex items-center gap-3"><AlertCircle className="h-5 w-5 shrink-0" /><span>{error}</span></div>
					  <button type="button" onClick={() => setRetryToken((token) => token + 1)} className="flex items-center gap-2 rounded-lg bg-rose-900/50 px-3 py-2 text-sm font-medium hover:bg-rose-900"><RefreshCw className="h-4 w-4" />Retry</button>
				</div>
			)}

			{loading ? (
				<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
					{Array.from({ length: 8 }, (_, index) => <SkeletonCard key={index} />)}
				</div>
			) : movies.length > 0 ? (
				<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
					{movies.map((movie) => <MovieCard key={movie.id} movie={movie} isWishlisted={isWishlisted(movie.id)} onToggleWishlist={onToggleWishlist} onSelectMovie={onSelectMovie} />)}
				</div>
			) : (
				<div className="rounded-2xl border border-dashed border-slate-700 py-20 text-center text-slate-400">No movies matched these filters.</div>
			)}

			{totalPages > 1 && (
				<div className="flex items-center justify-center gap-4 pt-2">
					<button type="button" disabled={page <= 1 || loading} onClick={() => setPage((currentPage) => currentPage - 1)} className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft className="h-4 w-4" />Previous</button>
					<span className="text-sm text-slate-400">Page {page} of {totalPages}</span>
					<button type="button" disabled={page >= totalPages || loading} onClick={() => setPage((currentPage) => currentPage + 1)} className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40">Next<ChevronRight className="h-4 w-4" /></button>
				</div>
			)}

			{loading && <Loader2 className="mx-auto h-5 w-5 animate-spin text-indigo-400" />}
		</section>
	);
}
