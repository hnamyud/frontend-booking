<script>
    import { X } from "lucide-svelte";
    import { createEventDispatcher } from "svelte";

    export let isOpen = false;
    export let filters = {
        priceMin: "",
        priceMax: "",
        sort: "-price", // Default sort
        timeStart_from: "",
        timeEnd_to: "",
    };

    const dispatch = createEventDispatcher();

    function applyFilters() {
        dispatch("apply", filters);
    }

    function clearFilters() {
        filters = {
            priceMin: "",
            priceMax: "",
            sort: "-price",
            timeStart_from: "",
            timeEnd_to: "",
        };
        dispatch("apply", filters);
    }
</script>

{#if isOpen}
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div
            class="absolute inset-0 bg-black/25 backdrop-blur-sm"
            on:click={() => dispatch("close")}
        ></div>

        <!-- Modal -->
        <div
            class="bg-white rounded-2xl shadow-xl w-full max-w-md relative z-10 overflow-hidden"
        >
            <div
                class="flex items-center justify-between p-4 border-b border-slate-100"
            >
                <button
                    on:click={() => dispatch("close")}
                    class="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                    <X size={20} />
                </button>
                <h3 class="font-bold text-lg text-slate-800">Filters</h3>
                <button
                    on:click={clearFilters}
                    class="text-sm font-medium text-slate-500 hover:underline"
                >
                    Clear all
                </button>
            </div>

            <div class="p-6 space-y-6">
                <!-- Sort -->
                <div class="space-y-3">
                    <h4 class="font-semibold text-slate-900">Sort by</h4>
                    <div class="grid grid-cols-2 gap-3">
                        <label class="cursor-pointer">
                            <input
                                type="radio"
                                bind:group={filters.sort}
                                value="price"
                                class="peer sr-only"
                            />
                            <div
                                class="px-4 py-2 rounded-full border border-slate-200 text-center text-sm font-medium peer-checked:bg-slate-900 peer-checked:text-white peer-checked:border-slate-900 transition-all hover:border-slate-400"
                            >
                                Low to High
                            </div>
                        </label>
                        <label class="cursor-pointer">
                            <input
                                type="radio"
                                bind:group={filters.sort}
                                value="-price"
                                class="peer sr-only"
                            />
                            <div
                                class="px-4 py-2 rounded-full border border-slate-200 text-center text-sm font-medium peer-checked:bg-slate-900 peer-checked:text-white peer-checked:border-slate-900 transition-all hover:border-slate-400"
                            >
                                High to Low
                            </div>
                        </label>
                    </div>
                </div>

                <!-- Price Range -->
                <div class="space-y-3">
                    <h4 class="font-semibold text-slate-900">Price Range</h4>
                    <div class="flex items-center gap-4">
                        <div class="relative flex-1">
                            <span
                                class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"
                                >Min</span
                            >
                            <input
                                type="number"
                                bind:value={filters.priceMin}
                                placeholder="0"
                                class="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all"
                            />
                        </div>
                        <div class="w-4 h-[1px] bg-slate-300"></div>
                        <div class="relative flex-1">
                            <span
                                class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"
                                >Max</span
                            >
                            <input
                                type="number"
                                bind:value={filters.priceMax}
                                placeholder="Any"
                                class="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all"
                            />
                        </div>
                    </div>
                </div>
                <div class="space-y-3">
                    <h4 class="font-semibold text-slate-900">Departure Date</h4>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="space-y-1">
                            <label class="text-xs text-slate-500 ml-1"
                                >From</label
                            >
                            <input
                                type="date"
                                bind:value={filters.timeStart_from}
                                class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all text-sm"
                            />
                        </div>
                        <div class="space-y-1">
                            <label class="text-xs text-slate-500 ml-1">To</label
                            >
                            <input
                                type="date"
                                bind:value={filters.timeEnd_to}
                                class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all text-sm"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div class="p-4 border-t border-slate-100">
                <button
                    on:click={applyFilters}
                    class="w-full bg-slate-900 hover:bg-black text-white py-3.5 rounded-xl font-semibold transition-colors"
                >
                    Show results
                </button>
            </div>
        </div>
    </div>
{/if}
