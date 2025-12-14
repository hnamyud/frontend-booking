<script>
    import { onMount } from "svelte";
    import { auth } from "../../stores/auth";
    import { api } from "../../api.svelte";
    import {
        Trash2,
        ChevronLeft,
        ChevronRight,
        Star,
        User,
    } from "lucide-svelte";

    let reviews = [];
    let meta = {
        current: 1,
        pageSize: 10,
        pages: 1,
        total: 0,
    };
    let isLoading = false;
    let error = "";

    async function fetchReviews(page = 1) {
        isLoading = true;
        error = "";
        try {
            const data = await api.getReviews({
                current: page,
                pageSize: meta.pageSize,
            });

            reviews = data.data.result;
            meta = data.data.meta;
        } catch (err) {
            console.error(err);
            error = "Failed to fetch reviews";
        } finally {
            isLoading = false;
        }
    }

    onMount(() => {
        fetchReviews();
    });

    function handlePageChange(newPage) {
        if (newPage >= 1 && newPage <= meta.pages) {
            fetchReviews(newPage);
        }
    }

    async function handleDelete(id) {
        if (!confirm("Are you sure you want to delete this review?")) return;

        try {
            await api.deleteReview(id);
            fetchReviews(meta.current);
        } catch (err) {
            console.error(err);
            alert("Error deleting review");
        }
    }

    function formatDate(isoString) {
        if (!isoString) return "N/A";
        return new Date(isoString).toLocaleDateString("vi-VN");
    }
</script>

<div class="space-y-6">
    <div class="flex justify-between items-center">
        <h3 class="text-lg font-semibold text-slate-800">Review List</h3>
    </div>

    {#if isLoading}
        <div class="flex justify-center py-12">
            <div
                class="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"
            ></div>
        </div>
    {:else if error}
        <div class="bg-red-50 text-red-600 p-4 rounded-lg text-center">
            {error}
        </div>
    {:else if reviews.length === 0}
        <div
            class="flex flex-col items-center justify-center py-12 text-slate-400"
        >
            <Star size={48} class="mb-4 opacity-20" />
            <p>No reviews found.</p>
        </div>
    {:else}
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr
                        class="border-b border-slate-200 text-slate-500 text-sm"
                    >
                        <th class="py-4 px-4 font-medium">User</th>
                        <th class="py-4 px-4 font-medium">Tour</th>
                        <th class="py-4 px-4 font-medium">Rating</th>
                        <th class="py-4 px-4 font-medium">Comment</th>
                        <th class="py-4 px-4 font-medium">Date</th>
                        <th class="py-4 px-4 font-medium text-right">Actions</th
                        >
                    </tr>
                </thead>
                <tbody class="text-slate-700">
                    {#each reviews as review}
                        <tr
                            class="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                        >
                            <td class="py-4 px-4 font-medium">
                                <div class="flex items-center gap-2">
                                    <User size={16} class="text-slate-400" />
                                    {review.user?.name ||
                                        review.user_id ||
                                        "Unknown"}
                                </div>
                            </td>
                            <td class="py-4 px-4 text-slate-500">
                                {review.tour?.name ||
                                    review.tour_id ||
                                    "Unknown"}
                            </td>
                            <td class="py-4 px-4">
                                <div
                                    class="flex items-center gap-1 text-amber-500"
                                >
                                    <span class="font-bold"
                                        >{review.rating}</span
                                    >
                                    <Star size={14} fill="currentColor" />
                                </div>
                            </td>
                            <td
                                class="py-4 px-4 max-w-md truncate"
                                title={review.comment}
                            >
                                {review.comment}
                            </td>
                            <td class="py-4 px-4 text-slate-500 text-sm">
                                {formatDate(review.createdAt)}
                            </td>
                            <td class="py-4 px-4">
                                <div class="flex justify-end gap-2">
                                    <button
                                        on:click={() =>
                                            handleDelete(review._id)}
                                        class="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete Review"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>

        <!-- Pagination -->
        <div
            class="flex justify-between items-center pt-4 border-t border-slate-100"
        >
            <div class="text-sm text-slate-500">
                Showing {(meta.current - 1) * meta.pageSize + 1} to {Math.min(
                    meta.current * meta.pageSize,
                    meta.total,
                )} of {meta.total} results
            </div>
            <div class="flex gap-2">
                <button
                    disabled={meta.current === 1}
                    on:click={() => handlePageChange(meta.current - 1)}
                    class="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600"
                >
                    <ChevronLeft size={20} />
                </button>
                {#each Array(meta.pages) as _, i}
                    <button
                        on:click={() => handlePageChange(i + 1)}
                        class="w-10 h-10 rounded-lg font-medium transition-colors {meta.current ===
                        i + 1
                            ? 'bg-emerald-600 text-white'
                            : 'text-slate-600 hover:bg-slate-50'}"
                    >
                        {i + 1}
                    </button>
                {/each}
                <button
                    disabled={meta.current === meta.pages}
                    on:click={() => handlePageChange(meta.current + 1)}
                    class="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600"
                >
                    <ChevronRight size={20} />
                </button>
            </div>
        </div>
    {/if}
</div>
