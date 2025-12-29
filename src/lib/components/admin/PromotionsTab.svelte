<script>
    import { onMount, tick } from "svelte";
    import { fade } from "svelte/transition";
    import {
        Plus,
        Search,
        Tag,
        Edit2,
        Trash2,
        Calendar,
        Percent,
        DollarSign,
        MoreVertical,
    } from "lucide-svelte";
    import { api } from "../../api.svelte";
    import PromotionModal from "./PromotionModal.svelte";

    let promotions = [];
    let isLoading = true;
    let error = "";

    // Pagination
    let currentPage = 1;
    let totalPages = 1;
    let totalPromotions = 0;
    const pageSize = 10;

    // Modal state
    let isModalOpen = false;
    let selectedPromotion = null;
    let isDeleting = false;

    onMount(() => {
        fetchPromotions();
    });

    async function fetchPromotions(page = 1) {
        isLoading = true;
        try {
            const res = await api.getPromotions({ current: page, pageSize });
            console.log(res); // Debug
            promotions = res.data.result;
            currentPage = res.data.meta.current;
            totalPages = res.data.meta.pages;
            totalPromotions = res.data.meta.total;
        } catch (err) {
            console.error(err);
            error = "Failed to load promotions.";
        } finally {
            isLoading = false;
        }
    }

    function openAddModal() {
        selectedPromotion = null;
        isModalOpen = true;
    }

    function openEditModal(promo) {
        selectedPromotion = promo;
        isModalOpen = true;
    }

    async function handleDelete(id) {
        if (
            !confirm(
                "Are you sure you want to delete this promotion? This action cannot be undone.",
            )
        )
            return;

        isDeleting = true;
        try {
            await api.deletePromotion(id);
            await fetchPromotions(currentPage); // Refresh list
        } catch (err) {
            console.error(err);
            alert("Failed to delete promotion.");
        } finally {
            isDeleting = false;
        }
    }

    function formatDate(dateStr) {
        if (!dateStr) return "-";
        return new Date(dateStr).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    }

    function formatCurrency(amount) {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount);
    }
</script>

<div class="space-y-6" in:fade>
    <!-- Header Actions -->
    <div
        class="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center"
    >
        <div class="relative w-full sm:w-96">
            <Search
                class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={20}
            />
            <input
                type="text"
                placeholder="Search promotions (Code)..."
                class="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
            />
            <!-- Note: Client side filtering or API search would go here, 
                 Current API just lists all, so search might need implementation later if not supported by backend yet. 
                 Since the prompt didn't specify search API, this is just UI for now. -->
        </div>

        <button
            on:click={openAddModal}
            class="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
        >
            <Plus size={20} />
            <span>New Promotion</span>
        </button>
    </div>

    <!-- Table -->
    <div
        class="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm"
    >
        <div class="overflow-x-auto">
            <table class="w-full text-left">
                <thead>
                    <tr class="bg-slate-50 border-b border-slate-100">
                        <th
                            class="px-6 py-4 font-semibold text-slate-700 text-sm"
                            >Code</th
                        >
                        <th
                            class="px-6 py-4 font-semibold text-slate-700 text-sm"
                            >Discount</th
                        >
                        <th
                            class="px-6 py-4 font-semibold text-slate-700 text-sm"
                            >Requirements</th
                        >
                        <th
                            class="px-6 py-4 font-semibold text-slate-700 text-sm"
                            >Usage</th
                        >
                        <th
                            class="px-6 py-4 font-semibold text-slate-700 text-sm"
                            >Duration</th
                        >
                        <th
                            class="px-6 py-4 font-semibold text-slate-700 text-sm"
                            >Status</th
                        >
                        <th
                            class="px-6 py-4 font-semibold text-slate-700 text-sm text-right"
                            >Actions</th
                        >
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    {#if isLoading}
                        {#each Array(5) as _}
                            <tr class="animate-pulse">
                                <td class="px-6 py-4"
                                    ><div
                                        class="h-4 bg-slate-100 rounded w-24"
                                    ></div></td
                                >
                                <td class="px-6 py-4"
                                    ><div
                                        class="h-4 bg-slate-100 rounded w-16"
                                    ></div></td
                                >
                                <td class="px-6 py-4"
                                    ><div
                                        class="h-4 bg-slate-100 rounded w-20"
                                    ></div></td
                                >
                                <td class="px-6 py-4"
                                    ><div
                                        class="h-4 bg-slate-100 rounded w-12"
                                    ></div></td
                                >
                                <td class="px-6 py-4"
                                    ><div
                                        class="h-4 bg-slate-100 rounded w-28"
                                    ></div></td
                                >
                                <td class="px-6 py-4"
                                    ><div
                                        class="h-6 bg-slate-100 rounded-full w-16"
                                    ></div></td
                                >
                                <td class="px-6 py-4 text-right"
                                    ><div
                                        class="h-8 bg-slate-100 rounded-lg w-8 ml-auto"
                                    ></div></td
                                >
                            </tr>
                        {/each}
                    {:else if error}
                        <tr>
                            <td
                                colspan="7"
                                class="px-6 py-10 text-center text-red-500"
                                >{error}</td
                            >
                        </tr>
                    {:else if promotions.length === 0}
                        <tr>
                            <td
                                colspan="7"
                                class="px-6 py-10 text-center text-slate-400"
                            >
                                <div class="flex flex-col items-center gap-3">
                                    <Tag size={48} class="opacity-20" />
                                    <p>No promotions found.</p>
                                </div>
                            </td>
                        </tr>
                    {:else}
                        {#each promotions as promo}
                            <tr
                                class="hover:bg-slate-50/50 transition-colors group"
                            >
                                <td class="px-6 py-4">
                                    <div
                                        class="font-bold text-slate-900 font-mono bg-slate-100 px-2 py-1 rounded inline-block text-sm"
                                    >
                                        {promo.code}
                                    </div>
                                </td>
                                <td class="px-6 py-4">
                                    <div
                                        class="flex items-center gap-2 text-emerald-600 font-medium"
                                    >
                                        {#if promo.discountType === "PERCENTAGE"}
                                            <Percent size={16} />
                                            <span>{promo.discountValue}%</span>
                                        {:else}
                                            <DollarSign size={16} />
                                            <span
                                                >{formatCurrency(
                                                    promo.discountValue,
                                                )}</span
                                            >
                                        {/if}
                                    </div>
                                    {#if promo.maxDiscountAmount > 0}
                                        <div
                                            class="text-xs text-slate-400 mt-1"
                                        >
                                            Max: {formatCurrency(
                                                promo.maxDiscountAmount,
                                            )}
                                        </div>
                                    {/if}
                                </td>
                                <td class="px-6 py-4">
                                    <div class="text-sm text-slate-600">
                                        Min: <span class="font-medium"
                                            >{formatCurrency(
                                                promo.minBookingValue,
                                            )}</span
                                        >
                                    </div>
                                </td>
                                <td class="px-6 py-4">
                                    <div class="flex items-center gap-2">
                                        <!-- Progress bar -->
                                        <div
                                            class="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden"
                                        >
                                            <div
                                                class="h-full bg-emerald-500 rounded-full"
                                                style="width: {Math.min(
                                                    (promo.usageCount /
                                                        promo.usageLimit) *
                                                        100,
                                                    100,
                                                )}%"
                                            ></div>
                                        </div>
                                        <span
                                            class="text-xs font-medium text-slate-600"
                                        >
                                            {promo.usageCount}/{promo.usageLimit}
                                        </span>
                                    </div>
                                </td>
                                <td class="px-6 py-4">
                                    <div class="text-sm text-slate-600">
                                        {formatDate(promo.startDate)} - {formatDate(
                                            promo.endDate,
                                        )}
                                    </div>
                                </td>
                                <td class="px-6 py-4">
                                    <span
                                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                        {promo.isActive
                                            ? 'bg-emerald-100 text-emerald-800'
                                            : 'bg-slate-100 text-slate-800'}"
                                    >
                                        {promo.isActive ? "Active" : "Inactive"}
                                    </span>
                                </td>
                                <td class="px-6 py-4">
                                    <div
                                        class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <button
                                            on:click={() =>
                                                openEditModal(promo)}
                                            class="p-2 hover:bg-white bg-slate-50 text-slate-600 rounded-lg shadow-sm border border-slate-200 transition-all hover:text-emerald-600 hover:border-emerald-200"
                                            title="Edit"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            on:click={() =>
                                                handleDelete(promo._id)}
                                            class="p-2 hover:bg-white bg-slate-50 text-slate-600 rounded-lg shadow-sm border border-slate-200 transition-all hover:text-red-500 hover:border-red-200"
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        {/each}
                    {/if}
                </tbody>
            </table>
        </div>

        <!-- Pagination -->
        {#if totalPages > 1}
            <div
                class="p-4 border-t border-slate-100 flex items-center justify-between"
            >
                <p class="text-sm text-slate-500">
                    Showing <span class="font-medium"
                        >{(currentPage - 1) * pageSize + 1}</span
                    >
                    to
                    <span class="font-medium"
                        >{Math.min(
                            currentPage * pageSize,
                            totalPromotions,
                        )}</span
                    >
                    of <span class="font-medium">{totalPromotions}</span> results
                </p>
                <div class="flex gap-2">
                    <button
                        disabled={currentPage === 1}
                        on:click={() => fetchPromotions(currentPage - 1)}
                        class="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>
                    <button
                        disabled={currentPage === totalPages}
                        on:click={() => fetchPromotions(currentPage + 1)}
                        class="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </div>
            </div>
        {/if}
    </div>
</div>

<PromotionModal
    isOpen={isModalOpen}
    promotion={selectedPromotion}
    on:close={() => (isModalOpen = false)}
    on:save={() => fetchPromotions(currentPage)}
/>
