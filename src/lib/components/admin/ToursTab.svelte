<script>
    import { onMount } from "svelte";
    import { auth } from "../../stores/auth";
    import {
        Pencil,
        Trash2,
        Plus,
        ChevronLeft,
        ChevronRight,
        Calendar,
        DollarSign,
        Clock,
    } from "lucide-svelte";
    import TourModal from "./TourModal.svelte";
    import { api } from "../../api.svelte";

    let tours = [];
    let meta = {
        current: 1,
        pageSize: 5,
        pages: 1,
        total: 0,
    };
    let isLoading = false;
    let error = "";

    // Modal State
    let isModalOpen = false;
    let selectedTour = null;
    let isSubmitting = false;

    async function fetchTours(page = 1) {
        isLoading = true;
        error = "";
        try {
            const data = await api.getTours({
                current: page,
                pageSize: meta.pageSize,
            });

            tours = data.data.result;
            meta = data.data.meta;
        } catch (err) {
            console.error(err);
            error = "Failed to fetch tours";
        } finally {
            isLoading = false;
        }
    }

    onMount(() => {
        fetchTours();
    });

    function handlePageChange(newPage) {
        if (newPage >= 1 && newPage <= meta.pages) {
            fetchTours(newPage);
        }
    }

    function openCreateModal() {
        selectedTour = null;
        isModalOpen = true;
    }

    function openEditModal(tour) {
        selectedTour = tour;
        isModalOpen = true;
    }

    async function handleSubmit(event) {
        const payload = event.detail;
        isSubmitting = true;

        try {
            if (selectedTour) {
                await api.updateTour(selectedTour._id, payload);
            } else {
                await api.createTour(payload);
            }

            isModalOpen = false;
            fetchTours(meta.current);
        } catch (err) {
            console.error(err);
            alert(err.message || "An error occurred");
        } finally {
            isSubmitting = false;
        }
    }

    async function handleDelete(id) {
        if (!confirm("Are you sure you want to delete this tour?")) return;

        try {
            await api.deleteTour(id);
            fetchTours(meta.current);
        } catch (err) {
            console.error(err);
            alert("Failed to delete tour");
        }
    }
</script>

<div class="space-y-6">
    <div class="flex justify-between items-center">
        <h3 class="text-lg font-semibold text-slate-800">Tour List</h3>
        <button
            on:click={openCreateModal}
            class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
            <Plus size={18} />
            <span>Add Tour</span>
        </button>
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
    {:else}
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr
                        class="border-b border-slate-200 text-slate-500 text-sm"
                    >
                        <th class="py-4 px-4 font-medium">Name</th>
                        <th class="py-4 px-4 font-medium">Duration</th>
                        <th class="py-4 px-4 font-medium">Price</th>
                        <th class="py-4 px-4 font-medium">Start Date</th>
                        <th class="py-4 px-4 font-medium">Slots</th>
                        <th class="py-4 px-4 font-medium text-right">Actions</th
                        >
                    </tr>
                </thead>
                <tbody class="text-slate-700">
                    {#each tours as tour}
                        <tr
                            class="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                        >
                            <td class="py-4 px-4 font-medium">
                                <div class="font-semibold text-slate-800">
                                    {tour.name}
                                </div>
                                <div
                                    class="text-xs text-slate-500 truncate max-w-[200px]"
                                >
                                    {tour.description}
                                </div>
                            </td>
                            <td class="py-4 px-4">
                                <div class="flex items-center gap-1 text-sm">
                                    <Clock size={14} class="text-slate-400" />
                                    {tour.duration}
                                    <span class="text-xs text-slate-400"
                                        >({tour.durationDays || "?"} days)</span
                                    >
                                </div>
                            </td>
                            <td class="py-4 px-4">
                                <div class="font-medium text-emerald-600">
                                    {new Intl.NumberFormat("vi-VN", {
                                        style: "currency",
                                        currency: "VND",
                                    }).format(tour.price)}
                                </div>
                            </td>
                            <td class="py-4 px-4">
                                <div class="flex items-center gap-1 text-sm">
                                    <Calendar
                                        size={14}
                                        class="text-slate-400"
                                    />
                                    {new Date(
                                        tour.timeStart,
                                    ).toLocaleDateString("vi-VN")}
                                </div>
                            </td>
                            <td class="py-4 px-4">
                                <div class="text-sm">
                                    <span class="font-medium text-slate-800"
                                        >{tour.bookedParticipants || 0}</span
                                    >
                                    <span class="text-slate-400">/</span>
                                    <span class="text-slate-500"
                                        >{tour.totalSlots}</span
                                    >
                                </div>
                                <div
                                    class="w-20 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden"
                                >
                                    <div
                                        class="h-full bg-emerald-500 rounded-full"
                                        style="width: {((tour.bookedParticipants ||
                                            0) /
                                            tour.totalSlots) *
                                            100}%"
                                    ></div>
                                </div>
                            </td>
                            <td class="py-4 px-4">
                                <div class="flex justify-end gap-2">
                                    <button
                                        on:click={() => openEditModal(tour)}
                                        class="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                    >
                                        <Pencil size={18} />
                                    </button>
                                    <button
                                        on:click={() => handleDelete(tour._id)}
                                        class="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

    <TourModal
        isOpen={isModalOpen}
        tour={selectedTour}
        isLoading={isSubmitting}
        on:close={() => (isModalOpen = false)}
        on:submit={handleSubmit}
    />
</div>
