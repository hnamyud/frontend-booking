<script>
    import { onMount } from "svelte";
    import { auth } from "../../stores/auth";
    import {
        Pencil,
        Trash2,
        Plus,
        ChevronLeft,
        ChevronRight,
    } from "lucide-svelte";
    import DestinationModal from "./DestinationModal.svelte";

    let destinations = [];
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
    let selectedDestination = null;
    let isSubmitting = false;

    async function fetchDestinations(page = 1) {
        isLoading = true;
        error = "";
        try {
            const response = await fetch(
                `http://localhost:8080/api/v1/destination?current=${page}&pageSize=${meta.pageSize}`,
                {
                    headers: {
                        Authorization: `Bearer ${$auth.token}`,
                    },
                },
            );

            if (response.ok) {
                const data = await response.json();
                destinations = data.data.result;
                meta = data.data.meta;
            } else {
                error = "Failed to fetch destinations";
            }
        } catch (err) {
            console.error(err);
            error = "An error occurred while fetching destinations";
        } finally {
            isLoading = false;
        }
    }

    onMount(() => {
        fetchDestinations();
    });

    function handlePageChange(newPage) {
        if (newPage >= 1 && newPage <= meta.pages) {
            fetchDestinations(newPage);
        }
    }

    function openCreateModal() {
        selectedDestination = null;
        isModalOpen = true;
    }

    function openEditModal(dest) {
        selectedDestination = dest;
        isModalOpen = true;
    }

    async function handleDelete(id) {
        if (!confirm("Are you sure you want to delete this destination?"))
            return;

        try {
            const response = await fetch(
                `http://localhost:8080/api/v1/destination/${id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${$auth.token}`,
                    },
                },
            );

            if (response.ok) {
                fetchDestinations(meta.current);
            } else {
                alert("Failed to delete destination");
            }
        } catch (err) {
            console.error(err);
            alert("Error deleting destination");
        }
    }

    async function handleSubmit(event) {
        const payload = event.detail;
        isSubmitting = true;

        try {
            const url = selectedDestination
                ? `http://localhost:8080/api/v1/destination/${selectedDestination._id}`
                : "http://localhost:8080/api/v1/destination";

            const method = selectedDestination ? "PATCH" : "POST";

            const response = await fetch(url, {
                method: method,
                headers: {
                    Authorization: `Bearer ${$auth.token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                isModalOpen = false;
                fetchDestinations(meta.current);
            } else {
                const data = await response.json();
                alert(data.message || "Operation failed");
            }
        } catch (err) {
            console.error(err);
            alert("An error occurred");
        } finally {
            isSubmitting = false;
        }
    }
</script>

<div class="space-y-6">
    <div class="flex justify-between items-center">
        <h3 class="text-lg font-semibold text-slate-800">Destination List</h3>
        <button
            on:click={openCreateModal}
            class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
            <Plus size={18} />
            <span>Add Destination</span>
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
                        <th class="py-4 px-4 font-medium">Image</th>
                        <th class="py-4 px-4 font-medium">Name</th>
                        <th class="py-4 px-4 font-medium">Country</th>
                        <th class="py-4 px-4 font-medium">Description</th>
                        <th class="py-4 px-4 font-medium text-right">Actions</th
                        >
                    </tr>
                </thead>
                <tbody class="text-slate-700">
                    {#each destinations as dest}
                        <tr
                            class="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                        >
                            <td class="py-4 px-4">
                                <img
                                    src={dest.images[0]?.url}
                                    alt={dest.name}
                                    class="w-16 h-12 object-cover rounded-lg"
                                />
                            </td>
                            <td class="py-4 px-4 font-medium">{dest.name}</td>
                            <td class="py-4 px-4">{dest.country}</td>
                            <td
                                class="py-4 px-4 max-w-xs truncate"
                                title={dest.description}
                            >
                                {dest.description}
                            </td>
                            <td class="py-4 px-4">
                                <div class="flex justify-end gap-2">
                                    <button
                                        on:click={() => openEditModal(dest)}
                                        class="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                    >
                                        <Pencil size={18} />
                                    </button>
                                    <button
                                        on:click={() => handleDelete(dest._id)}
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

    <DestinationModal
        isOpen={isModalOpen}
        destination={selectedDestination}
        isLoading={isSubmitting}
        on:close={() => (isModalOpen = false)}
        on:submit={handleSubmit}
    />
</div>
