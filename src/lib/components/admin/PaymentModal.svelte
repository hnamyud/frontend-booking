<script>
    import { createEventDispatcher } from "svelte";
    import { X, Save, CreditCard, CheckCircle } from "lucide-svelte";

    export let isOpen = false;
    export let payment = null;
    export let isLoading = false;

    const dispatch = createEventDispatcher();

    let status = "PENDING";
    let error = "";

    function initForm() {
        if (payment) {
            status = payment.status || "PENDING";
        }
    }

    // React to changes in payment prop when modal opens
    $: if (isOpen && payment) {
        initForm();
    }

    function handleSubmit() {
        dispatch("submit", { status });
    }
</script>

{#if isOpen}
    <div
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    >
        <div
            class="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col"
        >
            <div
                class="p-6 border-b border-slate-100 flex justify-between items-center"
            >
                <h3 class="text-xl font-bold text-slate-800">
                    Update Payment Status
                </h3>
                <button
                    on:click={() => dispatch("close")}
                    class="text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <X size={24} />
                </button>
            </div>

            <div class="p-6 space-y-6">
                {#if error}
                    <div class="p-4 bg-red-50 text-red-600 rounded-xl text-sm">
                        {error}
                    </div>
                {/if}

                <div class="space-y-4">
                    <!-- Status -->
                    <div class="space-y-2">
                        <label
                            for="status"
                            class="text-sm font-medium text-slate-700 flex items-center gap-2"
                        >
                            <CheckCircle size={16} /> Payment Status
                        </label>
                        <select
                            id="status"
                            bind:value={status}
                            class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                        >
                            <option value="PENDING">Pending</option>
                            <option value="SUCCESS">Success</option>
                            <option value="FAILED">Failed</option>
                        </select>
                    </div>

                    {#if payment}
                        <div
                            class="p-4 bg-slate-50 rounded-xl space-y-2 text-sm text-slate-600"
                        >
                            <div class="flex justify-between">
                                <span>Code:</span>
                                <span class="font-medium text-slate-800"
                                    >{payment.code}</span
                                >
                            </div>
                            <div class="flex justify-between">
                                <span>Amount:</span>
                                <span class="font-medium text-emerald-600">
                                    {new Intl.NumberFormat("vi-VN", {
                                        style: "currency",
                                        currency: "VND",
                                    }).format(payment.amount)}
                                </span>
                            </div>
                        </div>
                    {/if}
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
                        <Save size={18} />
                        <span>Update Status</span>
                    {/if}
                </button>
            </div>
        </div>
    </div>
{/if}
