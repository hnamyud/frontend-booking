<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { fade, scale } from "svelte/transition";
    import { X, Calendar } from "lucide-svelte";
    import { api, type Promotion } from "../../api.svelte";

    // Props
    export let isOpen = false;
    export let promotion: Promotion | null = null;

    const dispatch = createEventDispatcher();

    // Form data
    let code = "";
    let discountType: "PERCENTAGE" | "FIXED_AMOUNT" = "PERCENTAGE";
    let discountValue = 0;
    let maxDiscountAmount = 0;
    let minBookingValue = 0;
    let usageLimit = 0;
    let startDate = "";
    let endDate = "";
    let isActive = true;

    // Loading state
    let isSubmitting = false;
    let error = "";

    // Reset form when modal opens/closes or promotion changes
    $: if (isOpen) {
        if (promotion) {
            code = promotion.code;
            discountType = promotion.discountType;
            discountValue = promotion.discountValue;
            maxDiscountAmount = promotion.maxDiscountAmount;
            minBookingValue = promotion.minBookingValue;
            usageLimit = promotion.usageLimit;
            // Format dates for input[type="datetime-local"]
            startDate = new Date(promotion.startDate)
                .toISOString()
                .slice(0, 16);
            endDate = new Date(promotion.endDate).toISOString().slice(0, 16);
            isActive = promotion.isActive;
        } else {
            resetForm();
        }
        error = "";
    }

    function resetForm() {
        code = "";
        discountType = "PERCENTAGE";
        discountValue = 0;
        maxDiscountAmount = 0;
        minBookingValue = 0;
        usageLimit = 0;
        // Default start date to now, end date to 7 days from now
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        startDate = now.toISOString().slice(0, 16);

        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        nextWeek.setMinutes(
            nextWeek.getMinutes() - nextWeek.getTimezoneOffset(),
        );
        endDate = nextWeek.toISOString().slice(0, 16);

        isActive = true;
    }

    function close() {
        dispatch("close");
    }

    async function handleSubmit() {
        isSubmitting = true;
        error = "";

        try {
            const payload = {
                code,
                discountType,
                discountValue,
                maxDiscountAmount,
                minBookingValue,
                usageLimit,
                startDate: new Date(startDate).toISOString(),
                endDate: new Date(endDate).toISOString(),
                isActive,
            };

            if (promotion) {
                await api.updatePromotion(promotion._id, payload);
            } else {
                await api.createPromotion(payload);
            }

            dispatch("save");
            close();
        } catch (err) {
            console.error(err);
            error =
                "Failed to save promotion. Please check the code (must be unique) and try again.";
        } finally {
            isSubmitting = false;
        }
    }
</script>

{#if isOpen}
    <div
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        transition:fade={{ duration: 200 }}
    >
        <div
            class="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl"
            transition:scale={{ duration: 200, start: 0.95 }}
        >
            <!-- Header -->
            <div
                class="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white/80 backdrop-blur-md z-10"
            >
                <h2 class="text-xl font-bold text-slate-800">
                    {promotion ? "Edit Promotion" : "New Promotion"}
                </h2>
                <button
                    on:click={close}
                    class="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                    <X size={20} class="text-slate-500" />
                </button>
            </div>

            <!-- Body -->
            <div class="p-6 space-y-6">
                {#if error}
                    <div
                        class="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium"
                    >
                        {error}
                    </div>
                {/if}

                <!-- Code & Active -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="space-y-2">
                        <label
                            class="text-sm font-medium text-slate-700 block"
                            for="code"
                            >Code <span class="text-red-500">*</span></label
                        >
                        <input
                            type="text"
                            id="code"
                            bind:value={code}
                            class="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all uppercase placeholder:normal-case font-mono"
                            placeholder="SUMMER2026"
                            required
                        />
                    </div>
                    <div class="space-y-2">
                        <label
                            class="text-sm font-medium text-slate-700 block"
                            for="isActive">Status</label
                        >
                        <label
                            class="relative inline-flex items-center cursor-pointer mt-2"
                        >
                            <input
                                type="checkbox"
                                id="isActive"
                                bind:checked={isActive}
                                class="sr-only peer"
                            />
                            <div
                                class="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"
                            ></div>
                            <span
                                class="ml-3 text-sm font-medium text-slate-700"
                                >{isActive ? "Active" : "Inactive"}</span
                            >
                        </label>
                    </div>
                </div>

                <!-- Discount Settings -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="space-y-2">
                        <label
                            class="text-sm font-medium text-slate-700 block"
                            for="discountType">Discount Type</label
                        >
                        <select
                            id="discountType"
                            bind:value={discountType}
                            class="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all cursor-pointer bg-white"
                        >
                            <option value="PERCENTAGE">Percentage (%)</option>
                            <option value="FIXED_AMOUNT"
                                >Fixed Amount (VND)</option
                            >
                        </select>
                    </div>

                    <div class="space-y-2">
                        <label
                            class="text-sm font-medium text-slate-700 block"
                            for="discountValue"
                            >Value <span class="text-red-500">*</span></label
                        >
                        <input
                            type="number"
                            id="discountValue"
                            bind:value={discountValue}
                            class="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                            placeholder="e.g. 10 or 500000"
                            min="0"
                        />
                    </div>
                </div>

                {#if discountType === "PERCENTAGE"}
                    <div class="space-y-2">
                        <label
                            class="text-sm font-medium text-slate-700 block"
                            for="maxDiscount">Max Discount Amount (VND)</label
                        >
                        <input
                            type="number"
                            id="maxDiscount"
                            bind:value={maxDiscountAmount}
                            class="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                            placeholder="e.g. 1000000 (0 for no limit)"
                            min="0"
                        />
                        <p class="text-xs text-slate-500">
                            Maximum amount to discount when using percentage.
                            Set to 0 for unlimited.
                        </p>
                    </div>
                {/if}

                <!-- Requirements -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="space-y-2">
                        <label
                            class="text-sm font-medium text-slate-700 block"
                            for="minBooking">Min Booking Value (VND)</label
                        >
                        <input
                            type="number"
                            id="minBooking"
                            bind:value={minBookingValue}
                            class="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                            placeholder="e.g. 20000000"
                            min="0"
                        />
                    </div>
                    <div class="space-y-2">
                        <label
                            class="text-sm font-medium text-slate-700 block"
                            for="usageLimit">Usage Limit</label
                        >
                        <input
                            type="number"
                            id="usageLimit"
                            bind:value={usageLimit}
                            class="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                            placeholder="e.g. 100"
                            min="0"
                        />
                    </div>
                </div>

                <!-- Date Range -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="space-y-2">
                        <label
                            class="text-sm font-medium text-slate-700 block"
                            for="startDate">Start Date</label
                        >
                        <div class="relative">
                            <input
                                type="datetime-local"
                                id="startDate"
                                bind:value={startDate}
                                class="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                            />
                        </div>
                    </div>
                    <div class="space-y-2">
                        <label
                            class="text-sm font-medium text-slate-700 block"
                            for="endDate">End Date</label
                        >
                        <div class="relative">
                            <input
                                type="datetime-local"
                                id="endDate"
                                bind:value={endDate}
                                class="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <div
                class="p-6 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0 bg-white/80 backdrop-blur-md"
            >
                <button
                    on:click={close}
                    type="button"
                    class="px-6 py-2.5 rounded-xl text-slate-600 font-medium hover:bg-slate-50 transition-colors"
                >
                    Cancel
                </button>
                <button
                    on:click={handleSubmit}
                    disabled={isSubmitting ||
                        !code ||
                        !discountValue ||
                        !startDate ||
                        !endDate}
                    type="button"
                    class="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {#if isSubmitting}
                        <div
                            class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                        ></div>
                        <span>Saving...</span>
                    {:else}
                        <span
                            >{promotion
                                ? "Update Promotion"
                                : "Create Promotion"}</span
                        >
                    {/if}
                </button>
            </div>
        </div>
    </div>
{/if}
