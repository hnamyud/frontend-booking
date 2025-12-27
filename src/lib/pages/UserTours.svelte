<script>
    import {
        Search,
        SlidersHorizontal,
        MapPin,
        Loader2,
        ArrowLeft,
    } from "lucide-svelte";
    import TourCard from "../components/user/TourCard.svelte";
    import TourFilters from "../components/user/TourFilters.svelte";
    import { api } from "../api.svelte";
    import { onMount } from "svelte";
    import { fade, fly } from "svelte/transition";

    let tours = [];
    let isLoading = false;
    let error = "";
    let isFilterOpen = false;

    let filters = {
        destinationName: "",
        sort: "-price", // Default: High to Low
        priceMin: "",
        priceMax: "",
        timeStart_from: "",
        timeEnd_to: "",
        current: 1,
        pageSize: 10, // Larger page size for immersive feel
    };

    let meta = {
        total: 0,
        pages: 1,
    };

    async function fetchTours() {
        isLoading = true;
        error = "";
        try {
            const params = {
                current: filters.current,
                pageSize: filters.pageSize,
                sort: filters.sort,
            };

            if (filters.destinationName)
                params.destinationName = filters.destinationName;
            if (filters.priceMin) params.priceMin = Number(filters.priceMin);
            if (filters.priceMax) params.priceMax = Number(filters.priceMax);
            if (filters.timeStart_from)
                params.timeStart_from = filters.timeStart_from;
            if (filters.timeEnd_to) params.timeEnd_to = filters.timeEnd_to;

            const response = await api.getTours(params);
            tours = response.data.result;
            meta = response.data.meta;
        } catch (err) {
            console.error(err);
            error = "Unable to load tours at the moment.";
        } finally {
            isLoading = false;
        }
    }

    // Debounce search
    let searchTimeout;
    function handleSearch() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            filters.current = 1;
            fetchTours();
        }, 500);
    }

    function handleFilterApply(event) {
        const newFilters = event.detail;
        filters = { ...filters, ...newFilters, current: 1 };
        isFilterOpen = false;
        fetchTours();
    }

    onMount(() => {
        const urlParams = new URLSearchParams(window.location.search);

        if (urlParams.has("destinationName"))
            filters.destinationName = urlParams.get("destinationName");
        if (urlParams.has("sort")) filters.sort = urlParams.get("sort");
        if (urlParams.has("priceMin"))
            filters.priceMin = urlParams.get("priceMin");
        if (urlParams.has("priceMax"))
            filters.priceMax = urlParams.get("priceMax");
        if (urlParams.has("timeStart_from"))
            filters.timeStart_from = urlParams.get("timeStart_from");
        if (urlParams.has("timeEnd_to"))
            filters.timeEnd_to = urlParams.get("timeEnd_to");
        if (urlParams.has("current"))
            filters.current = parseInt(urlParams.get("current"));
        if (urlParams.has("pageSize"))
            filters.pageSize = parseInt(urlParams.get("pageSize"));

        fetchTours();
    });
</script>

<div
    class="min-h-screen bg-white pb-20"
    in:fly={{ y: 20, duration: 400, delay: 200 }}
>
    <!-- Sticky Header -->
    <header
        class="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-100 shadow-sm transition-all duration-300"
    >
        <div class="container mx-auto px-4 h-20 flex items-center gap-4">
            <button
                on:click={() =>
                    window.dispatchEvent(
                        new CustomEvent("app:navigate", { detail: "/" }),
                    )}
                class="p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors shrink-0"
                title="Back to Home"
            >
                <ArrowLeft size={20} />
            </button>

            <!-- Search Bar -->
            <div class="flex-1 max-w-2xl mx-auto w-full relative group">
                <div
                    class="absolute inset-y-0 left-4 flex items-center pointer-events-none"
                >
                    <Search
                        class="text-slate-400 group-focus-within:text-slate-900 transition-colors"
                        size={20}
                    />
                </div>
                <input
                    type="text"
                    bind:value={filters.destinationName}
                    on:input={handleSearch}
                    placeholder="Where to? (e.g. Metz, Zurich)"
                    class="w-full pl-12 pr-14 py-3.5 rounded-full bg-slate-100 border-transparent focus:bg-white focus:border-slate-300 focus:ring-4 focus:ring-slate-100 outline-none transition-all shadow-sm text-slate-900 font-medium placeholder:font-normal"
                />
                <button
                    on:click={() => (isFilterOpen = true)}
                    class="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white hover:bg-slate-50 border border-slate-200 shadow-sm text-slate-600 transition-all hover:scale-105"
                >
                    <SlidersHorizontal size={18} />
                </button>
            </div>
        </div>
    </header>

    <!-- Content -->
    <main class="container mx-auto px-4 pt-8">
        {#if isLoading && tours.length === 0}
            <div
                class="flex flex-col items-center justify-center py-20"
                in:fade
            >
                <Loader2 class="animate-spin text-emerald-600 mb-4" size={40} />
                <p class="text-slate-500">Finding best tours for you...</p>
            </div>
        {:else if error}
            <div
                class="text-center py-20 bg-red-50 rounded-3xl mx-auto max-w-2xl"
                in:fade
            >
                <p class="text-red-600 font-medium">{error}</p>
                <button
                    on:click={fetchTours}
                    class="mt-4 text-sm font-semibold text-slate-700 underline"
                    >Try Again</button
                >
            </div>
        {:else if tours.length === 0}
            <div class="text-center py-20" in:fade>
                <div
                    class="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                    <MapPin size={32} class="text-slate-300" />
                </div>
                <h3 class="text-xl font-bold text-slate-900 mb-2">
                    No tours found
                </h3>
                <p class="text-slate-500 max-w-md mx-auto">
                    We couldn't find any tours matching your criteria. Try
                    changing your filters or destination.
                </p>
                <button
                    on:click={() => {
                        filters.destinationName = "";
                        filters.priceMin = "";
                        filters.priceMax = "";
                        filters.timeStart_from = "";
                        filters.timeEnd_to = "";
                        fetchTours();
                    }}
                    class="mt-6 px-6 py-2.5 bg-slate-900 text-white rounded-full font-medium hover:bg-black transition-all"
                >
                    Clear Search
                </button>
            </div>
        {:else}
            <div
                class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10"
            >
                {#each tours as tour, i}
                    <div in:fly={{ y: 20, duration: 400, delay: i * 50 }}>
                        <TourCard {tour} />
                    </div>
                {/each}
            </div>

            <!-- Pagination/Load More (Simple version) -->
            {#if meta.pages > 1}
                <div class="flex justify-center mt-12 gap-2">
                    <button
                        disabled={filters.current === 1}
                        on:click={() => {
                            filters.current--;
                            fetchTours();
                            window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        class="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                        Previous
                    </button>
                    <span
                        class="flex items-center px-4 font-medium text-slate-600"
                    >
                        Page {filters.current} of {meta.pages}
                    </span>
                    <button
                        disabled={filters.current === meta.pages}
                        on:click={() => {
                            filters.current++;
                            fetchTours();
                            window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        class="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                        Next
                    </button>
                </div>
            {/if}
        {/if}
    </main>

    <TourFilters
        isOpen={isFilterOpen}
        filters={{
            priceMin: filters.priceMin,
            priceMax: filters.priceMax,
            timeStart_from: filters.timeStart_from,
            timeEnd_to: filters.timeEnd_to,
            sort: filters.sort,
        }}
        on:close={() => (isFilterOpen = false)}
        on:apply={handleFilterApply}
    />
</div>
