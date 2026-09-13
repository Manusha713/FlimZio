import React from 'react';

export default function SkeletonCard() {
	return (
		<div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
			<div className="aspect-[2/3] animate-pulse bg-slate-800" />
			<div className="space-y-3 p-4">
				<div className="h-4 w-4/5 animate-pulse rounded bg-slate-800" />
				<div className="h-3 w-1/3 animate-pulse rounded bg-slate-800" />
			</div>
		</div>
	);
}
