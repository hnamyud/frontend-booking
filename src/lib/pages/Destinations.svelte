<script>
    import { onMount } from "svelte";
    import { fade, fly } from "svelte/transition";
    import { api } from "../api.svelte";
    import {
        Search,
        MapPin,
        ChevronLeft,
        ChevronRight,
        Loader2,
    } from "lucide-svelte";

    let destinations = [];
    let meta = {
        current: 1,
        pageSize: 6,
        pages: 1,
        total: 0,
    };
    let isLoading = true;
    let searchQuery = "";
    let searchTimeout;

    // Fetch destinations
    async function fetchDestinations(page = 1) {
        isLoading = true;
        try {
            const params = {
                current: page,
                pageSize: meta.pageSize,
                destinationName: searchQuery,
            };

            const response = await api.getDestinations(params);
            if (response && response.data) {
                destinations = response.data.result;
                meta = response.data.meta;
            }
        } catch (error) {
            console.error("Failed to fetch destinations:", error);
        } finally {
            isLoading = false;
        }
    }

    // Handle search with debounce
    function handleSearch() {
        if (searchTimeout) clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            fetchDestinations(1);
        }, 500);
    }

    onMount(() => {
        fetchDestinations();
    });

    // Image hover logic
    let hoveredIndex = -1;
</script>

<div class="min-h-screen bg-slate-50 pt-24 pb-12 font-sans">
    <!-- Header Section -->
    <div class="container mx-auto px-4 mb-12">
        <div
            class="flex flex-col md:flex-row items-center justify-between gap-6"
        >
            <div>
                <h1 class="text-3xl md:text-4xl font-bold text-sky-900 mb-2">
                    Khám phá Điểm đến
                </h1>
                <p class="text-slate-500">
                    Tìm kiếm những địa điểm tuyệt vời cho chuyến đi tiếp theo
                    của bạn
                </p>
            </div>

            <!-- Search Bar -->
            <div class="relative w-full md:w-96">
                <input
                    type="text"
                    bind:value={searchQuery}
                    on:input={handleSearch}
                    placeholder="Bạn muốn đi đâu?"
                    class="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all shadow-sm"
                />
                <Search
                    class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={20}
                />
            </div>
        </div>
    </div>

    <!-- Content Section -->
    <div class="container mx-auto px-4">
        {#if isLoading}
            <div class="flex justify-center items-center h-96">
                <Loader2 class="w-10 h-10 text-emerald-600 animate-spin" />
            </div>
        {:else if destinations.length === 0}
            <div
                class="text-center py-20 bg-white rounded-3xl shadow-sm border border-slate-100"
            >
                <MapPin size={48} class="mx-auto text-slate-300 mb-4" />
                <h3 class="text-xl font-bold text-slate-700 mb-2">
                    Không tìm thấy điểm đến
                </h3>
                <p class="text-slate-500">
                    Vui lòng thử tìm kiếm với từ khóa khác
                </p>
            </div>
        {:else}
            <!-- Grid Layout -->
            <div
                class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
            >
                {#each destinations as destination, index (destination._id)}
                    <div
                        role="button"
                        aria-label="View details for {destination.name}"
                        tabindex="0"
                        in:fly={{ y: 20, duration: 400, delay: index * 100 }}
                        class="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 h-full flex flex-col border border-slate-100 cursor-pointer outline-none focus:ring-2 focus:ring-emerald-500"
                        on:mouseenter={() => (hoveredIndex = index)}
                        on:mouseleave={() => (hoveredIndex = -1)}
                        on:click={() =>
                            window.dispatchEvent(
                                new CustomEvent("app:navigate", {
                                    detail: `/destinations/${destination._id}`,
                                }),
                            )}
                        on:keydown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                window.dispatchEvent(
                                    new CustomEvent("app:navigate", {
                                        detail: `/destinations/${destination._id}`,
                                    }),
                                );
                            }
                        }}
                    >
                        <!-- Image Container -->
                        <div class="relative h-64 overflow-hidden">
                            {#if destination.images && destination.images.length > 0}
                                <!-- Primary Image -->
                                <img
                                    src={destination.images[0].url}
                                    alt={destination.name}
                                    class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />

                                <!-- Secondary Image (Hover reveal) -->
                                {#if destination.images.length > 1 && hoveredIndex === index}
                                    <div
                                        in:fade={{ duration: 300 }}
                                        class="absolute inset-0"
                                    >
                                        <img
                                            src={destination.images[1].url}
                                            alt={destination.name}
                                            class="w-full h-full object-cover"
                                        />
                                    </div>
                                {/if}

                                <!-- Pagination dots if multiple images -->
                                {#if destination.images.length > 1}
                                    <div
                                        class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10"
                                    >
                                        {#each destination.images.slice(0, 3) as _, i}
                                            <div
                                                class={`w-2 h-2 rounded-full transition-colors ${
                                                    (i === 0 &&
                                                        hoveredIndex !==
                                                            index) ||
                                                    (i === 1 &&
                                                        hoveredIndex === index)
                                                        ? "bg-white"
                                                        : "bg-white/50"
                                                }`}
                                            ></div>
                                        {/each}
                                        {#if destination.images.length > 3}
                                            <div
                                                class="w-1.5 h-1.5 rounded-full bg-white/50"
                                            ></div>
                                        {/if}
                                    </div>
                                {/if}
                            {:else}
                                <div
                                    class="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400"
                                >
                                    <MapPin size={40} />
                                </div>
                            {/if}

                            <!-- Badge overlay -->
                            <div
                                class="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-sky-900 shadow-sm"
                            >
                                Popular
                            </div>
                        </div>

                        <!-- Card Content -->
                        <div class="p-6 flex-1 flex flex-col">
                            <h2
                                class="text-2xl font-bold text-slate-800 mb-2 group-hover:text-emerald-600 transition-colors"
                            >
                                {destination.name}
                            </h2>

                            <div
                                class="flex items-center gap-2 text-slate-500 mb-4 text-sm font-medium"
                            >
                                <MapPin size={16} class="text-emerald-500" />
                                {destination.country}
                            </div>

                            <p
                                class="text-slate-600 line-clamp-3 mb-6 text-sm flex-1 leading-relaxed"
                            >
                                {destination.description}
                            </p>

                            <!-- Button -->
                            <button
                                class="w-full py-3 bg-slate-50 text-slate-700 font-bold rounded-xl hover:bg-emerald-600 hover:text-white transition-all duration-300"
                                on:click={(e) => {
                                    e.stopPropagation();
                                    window.dispatchEvent(
                                        new CustomEvent("app:navigate", {
                                            detail: `/destinations/${destination._id}`,
                                        }),
                                    );
                                }}
                            >
                                Xem chi tiết
                            </button>
                        </div>
                    </div>
                {/each}
            </div>

            <!-- Pagination -->
            {#if meta.pages > 1}
                <div class="flex flex-col items-center gap-4">
                    <div
                        class="flex items-center gap-2 bg-white p-2 rounded-2xl shadow-sm border border-slate-100"
                    >
                        <button
                            disabled={meta.current === 1}
                            on:click={() => fetchDestinations(meta.current - 1)}
                            class="p-2 w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-slate-600"
                        >
                            <ChevronLeft size={20} />
                        </button>

                        {#each Array(meta.pages) as _, i}
                            <button
                                on:click={() => fetchDestinations(i + 1)}
                                class={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${
                                    meta.current === i + 1
                                        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/30"
                                        : "text-slate-600 hover:bg-slate-50"
                                }`}
                            >
                                {i + 1}
                            </button>
                        {/each}

                        <button
                            disabled={meta.current === meta.pages}
                            on:click={() => fetchDestinations(meta.current + 1)}
                            class="p-2 w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-slate-600"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    <div class="text-slate-400 text-sm font-medium">
                        Đang hiện {destinations.length} trên {meta.total} điểm đến
                    </div>
                </div>
            {/if}
        {/if}
    </div>
</div>
