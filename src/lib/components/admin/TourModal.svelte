<script>
    import { X, Calendar, Clock, DollarSign, MapPin } from "lucide-svelte";
    import { createEventDispatcher, onMount } from "svelte";
    import { auth } from "../../stores/auth";
    import { api } from "../../api.svelte";

    export let isOpen = false;
    export let tour = null; // If null, it's create mode
    export let isLoading = false;

    const dispatch = createEventDispatcher();

    let name = "";
    let description = "";
    let duration = "";
    let price = 0;
    let timeStart = "";
    let timeEnd = "";
    let totalSlots = 0;
    let isAvailable = true;
    let selectedDestinations = [];
    let availableDestinations = [];
    let error = "";

    $: if (isOpen) {
        fetchDestinations();
        if (tour) {
            name = tour.name;
            description = tour.description;
            duration = tour.duration;
            price = tour.price;
            timeStart = tour.timeStart
                ? new Date(tour.timeStart).toISOString().slice(0, 16)
                : "";
            timeEnd = tour.timeEnd
                ? new Date(tour.timeEnd).toISOString().slice(0, 16)
                : "";
            totalSlots = tour.totalSlots;
            isAvailable = tour.isAvailable;
            selectedDestinations = tour.destinations.map((d) => d._id || d);
        } else {
            resetForm();
        }
    }

    function resetForm() {
        name = "";
        description = "";
        duration = "";
        price = 0;
        timeStart = "";
        timeEnd = "";
        totalSlots = 0;
        isAvailable = true;
        selectedDestinations = [];
        error = "";
    }

    async function fetchDestinations() {
        try {
            // Fetch all destinations for selection (assuming pagination is large enough or implement search later)
            const data = await api.request(
                `/api/v1/destination?current=1&pageSize=100`,
                "GET",
                undefined,
                { Authorization: `Bearer ${$auth.token}` },
            );
            availableDestinations = data.data.result;
        } catch (err) {
            console.error("Failed to fetch destinations", err);
        }
    }

    function toggleDestination(id) {
        if (selectedDestinations.includes(id)) {
            selectedDestinations = selectedDestinations.filter((d) => d !== id);
        } else {
            selectedDestinations = [...selectedDestinations, id];
        }
    }

    function handleSubmit() {
        if (
            !name ||
            !description ||
            !duration ||
            !price ||
            !timeStart ||
            !timeEnd ||
            !totalSlots
        ) {
            error = "Please fill all required fields";
            return;
        }

        const payload = {
            name,
            description,
            duration,
            price: Number(price),
            timeStart: new Date(timeStart).toISOString(),
            timeEnd: new Date(timeEnd).toISOString(),
            totalSlots: Number(totalSlots),
            isAvailable,
            destinations: selectedDestinations,
        };

        dispatch("submit", payload);
    }
</script>

{#if isOpen}
    <div
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    >
        <div
            class="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden max-h-[90vh] flex flex-col"
        >
            <div
                class="p-6 border-b border-slate-100 flex justify-between items-center"
            >
                <h3 class="text-xl font-bold text-slate-800">
                    {tour ? "Edit Tour" : "Add New Tour"}
                </h3>
                <button
                    on:click={() => dispatch("close")}
                    class="text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <X size={24} />
                </button>
            </div>

            <div class="p-6 overflow-y-auto flex-1 space-y-6">
                {#if error}
                    <div class="p-4 bg-red-50 text-red-600 rounded-xl text-sm">
                        {error}
                    </div>
                {/if}

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="space-y-2">
                        <label
                            for="name"
                            class="text-sm font-medium text-slate-700"
                            >Name</label
                        >
                        <input
                            id="name"
                            type="text"
                            bind:value={name}
                            class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                            placeholder="Tour Name"
                        />
                    </div>
                    <div class="space-y-2">
                        <label
                            for="duration"
                            class="text-sm font-medium text-slate-700"
                            >Duration</label
                        >
                        <input
                            id="duration"
                            type="text"
                            bind:value={duration}
                            class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                            placeholder="e.g. 3 days 2 nights"
                        />
                    </div>
                </div>

                <div class="space-y-2">
                    <label
                        for="description"
                        class="text-sm font-medium text-slate-700"
                        >Description</label
                    >
                    <textarea
                        id="description"
                        bind:value={description}
                        rows="3"
                        class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all resize-none"
                        placeholder="Tour Description"
                    ></textarea>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="space-y-2">
                        <label
                            for="price"
                            class="text-sm font-medium text-slate-700"
                            >Price</label
                        >
                        <div class="relative">
                            <DollarSign
                                size={18}
                                class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />
                            <input
                                id="price"
                                type="number"
                                bind:value={price}
                                class="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                                placeholder="0"
                            />
                        </div>
                    </div>
                    <div class="space-y-2">
                        <label
                            for="totalSlots"
                            class="text-sm font-medium text-slate-700"
                            >Total Slots</label
                        >
                        <input
                            id="totalSlots"
                            type="number"
                            bind:value={totalSlots}
                            class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                            placeholder="0"
                        />
                    </div>
                    <div class="flex items-center pt-8">
                        <label class="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                bind:checked={isAvailable}
                                class="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            <span class="text-sm font-medium text-slate-700"
                                >Available</span
                            >
                        </label>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="space-y-2">
                        <label
                            for="timeStart"
                            class="text-sm font-medium text-slate-700"
                            >Start Time</label
                        >
                        <input
                            id="timeStart"
                            type="datetime-local"
                            bind:value={timeStart}
                            class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                        />
                    </div>
                    <div class="space-y-2">
                        <label
                            for="timeEnd"
                            class="text-sm font-medium text-slate-700"
                            >End Time</label
                        >
                        <input
                            id="timeEnd"
                            type="datetime-local"
                            bind:value={timeEnd}
                            class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                        />
                    </div>
                </div>

                <div class="space-y-2">
                    <label class="text-sm font-medium text-slate-700"
                        >Destinations</label
                    >
                    <div
                        class="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-40 overflow-y-auto border border-slate-200 rounded-xl p-3"
                    >
                        {#each availableDestinations as dest}
                            <label
                                class="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-100 transition-all {selectedDestinations.includes(
                                    dest._id,
                                )
                                    ? 'bg-emerald-50 border-emerald-100'
                                    : ''}"
                                for={`dest-${dest._id}`}
                            >
                                <input
                                    id={`dest-${dest._id}`}
                                    type="checkbox"
                                    checked={selectedDestinations.includes(
                                        dest._id,
                                    )}
                                    on:change={() =>
                                        toggleDestination(dest._id)}
                                    class="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                />
                                <span class="text-sm text-slate-700 truncate"
                                    >{dest.name}</span
                                >
                            </label>
                        {/each}
                    </div>
                </div>
            </div>

            <div class="p-6 border-t border-slate-100 flex justify-end gap-3">
                <button
                    on:click={() => dispatch("close")}
                    class="px-6 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                    Cancel
                </button>
                <button
                    on:click={handleSubmit}
                    disabled={isLoading}
                    class="px-6 py-2.5 rounded-xl font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {#if isLoading}
                        <div
                            class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                        ></div>
                        <span>Processing...</span>
                    {:else}
                        <span>{tour ? "Update" : "Create"} Tour</span>
                    {/if}
                </button>
            </div>
        </div>
    </div>
{/if}
