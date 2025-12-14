<script>
    import { onMount } from "svelte";
    import { auth } from "../../stores/auth";
    import {
        Pencil,
        Trash2,
        Plus,
        ChevronLeft,
        ChevronRight,
        X,
    } from "lucide-svelte";
    import { fade } from "svelte/transition";
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

    // Lightbox State
    let isLightboxOpen = false;
    let lightboxImages = [];
    let currentLightboxIndex = 0;

    import { api } from "../../api.svelte";

    async function fetchDestinations(page = 1) {
        isLoading = true;
        error = "";
        try {
            const data = await api.request(
                `/api/v1/destination?current=${page}&pageSize=${meta.pageSize}`,
                "GET",
                undefined,
                { Authorization: `Bearer ${$auth.token}` },
            );

            destinations = data.data.result;
            meta = data.data.meta;
        } catch (err) {
            console.error(err);
            error = "Failed to fetch destinations";
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
            await api.request(
                `/api/v1/destination/${id}`,
                "DELETE",
                undefined,
                { Authorization: `Bearer ${$auth.token}` },
            );

            fetchDestinations(meta.current);
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
                ? `/api/v1/destination/${selectedDestination._id}`
                : "/api/v1/destination";

            const method = selectedDestination ? "PATCH" : "POST";

            await api.request(url, method, payload, {
                Authorization: `Bearer ${$auth.token}`,
            });

            isModalOpen = false;
            fetchDestinations(meta.current);
        } catch (err) {
            console.error(err);
            alert(err.message || "An error occurred");
        } finally {
            isSubmitting = false;
        }
    }

    // Lightbox Functions
    function openLightbox(images, index = 0) {
        if (!images || images.length === 0) return;
        lightboxImages = images;
        currentLightboxIndex = index;
        isLightboxOpen = true;
        document.body.style.overflow = "hidden";
    }

    function closeLightbox() {
        isLightboxOpen = false;
        lightboxImages = [];
        currentLightboxIndex = 0;
        document.body.style.overflow = "";
    }

    function nextImage(e) {
        e?.stopPropagation();
        if (currentLightboxIndex < lightboxImages.length - 1) {
            currentLightboxIndex++;
        } else {
            currentLightboxIndex = 0;
        }
    }

    function prevImage(e) {
        e?.stopPropagation();
        if (currentLightboxIndex > 0) {
            currentLightboxIndex--;
        } else {
            currentLightboxIndex = lightboxImages.length - 1;
        }
    }

    function handleKeydown(e) {
        if (!isLightboxOpen) return;
        if (e.key === "Escape") closeLightbox();
        if (e.key === "ArrowRight") nextImage();
        if (e.key === "ArrowLeft") prevImage();
    }
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="space-y-6">
    <div class="flex justify-between items-center">
        <h3 class="text-lg font-semibold text-slate-800">Destination List</h3>
        {#if $auth.isAdmin}
            <button
                on:click={openCreateModal}
                class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
                <Plus size={18} />
                <span>Add Destination</span>
            </button>
        {/if}
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
                                <button
                                    class="block relative group overflow-hidden rounded-lg"
                                    on:click={() =>
                                        openLightbox(dest.images, 0)}
                                >
                                    <img
                                        src={dest.images[0]?.url}
                                        alt={dest.name}
                                        class="w-16 h-12 object-cover transition-transform group-hover:scale-110"
                                    />
                                    <div
                                        class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"
                                    ></div>
                                </button>
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
                                    {#if $auth.isAdmin}
                                        <button
                                            on:click={() => openEditModal(dest)}
                                            class="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                        >
                                            <Pencil size={18} />
                                        </button>
                                        <button
                                            on:click={() =>
                                                handleDelete(dest._id)}
                                            class="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    {/if}
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

    <!-- Lightbox Overlay -->
    {#if isLightboxOpen}
        <div
            class="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm"
            on:click={closeLightbox}
            transition:fade={{ duration: 200 }}
        >
            <!-- Close Button (Top Left) -->
            <button
                on:click={closeLightbox}
                class="absolute top-6 left-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all z-50"
            >
                <X size={32} />
            </button>

            <!-- Main Image Container -->
            <div
                class="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center"
                on:click|stopPropagation
            >
                {#if lightboxImages[currentLightboxIndex]}
                    <img
                        src={lightboxImages[currentLightboxIndex].url}
                        alt="Lightbox"
                        class="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                    />
                {/if}

                <!-- Navigation Arrows -->
                {#if lightboxImages.length > 1}
                    <button
                        on:click={prevImage}
                        class="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 p-3 rounded-full transition-all backdrop-blur-md"
                    >
                        <ChevronLeft size={40} />
                    </button>
                    <button
                        on:click={nextImage}
                        class="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 p-3 rounded-full transition-all backdrop-blur-md"
                    >
                        <ChevronRight size={40} />
                    </button>
                {/if}

                <!-- Image Counter -->
                <div
                    class="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 bg-black/40 px-4 py-1 rounded-full text-sm backdrop-blur-md font-medium tracking-wide"
                >
                    {currentLightboxIndex + 1} / {lightboxImages.length}
                </div>
            </div>
        </div>
    {/if}
</div>
