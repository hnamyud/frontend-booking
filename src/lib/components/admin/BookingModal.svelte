<script>
    import { createEventDispatcher, onMount } from "svelte";
    import {
        X,
        Save,
        User,
        Phone,
        Mail,
        CreditCard,
        StickyNote,
        CheckCircle,
    } from "lucide-svelte";

    export let isOpen = false;
    export let booking = null;
    export let isLoading = false;

    const dispatch = createEventDispatcher();

    let form = {
        status: "PENDING",
        payment_status: "PENDING",
        contactInfo: {
            fullName: "",
            phone: "",
            email: "",
        },
        note: "",
    };

    let error = "";

    function initForm() {
        if (booking) {
            form = {
                status: booking.status || "PENDING",
                payment_status: booking.payment_status || "PENDING",
                contactInfo: {
                    fullName: booking.contactInfo?.fullName || "",
                    phone: booking.contactInfo?.phone || "",
                    email: booking.contactInfo?.email || "",
                },
                note: booking.note || "",
            };
        }
    }

    // React to changes in booking prop when modal opens
    $: if (isOpen && booking) {
        initForm();
    }

    function handleSubmit() {
        if (!form.contactInfo.fullName || !form.contactInfo.email) {
            error = "Name and Email are required";
            return;
        }

        const payload = {
            status: form.status,
            payment_status: form.payment_status,
            contactInfo: form.contactInfo,
            note: form.note,
        };

        dispatch("submit", payload);
    }
</script>

{#if isOpen}
    <div
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    >
        <div
            class="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col"
        >
            <div
                class="p-6 border-b border-slate-100 flex justify-between items-center"
            >
                <h3 class="text-xl font-bold text-slate-800">Edit Booking</h3>
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
                    <!-- Status -->
                    <div class="space-y-2">
                        <label
                            for="status"
                            class="text-sm font-medium text-slate-700 flex items-center gap-2"
                        >
                            <CheckCircle size={16} /> Booking Status
                        </label>
                        <select
                            id="status"
                            bind:value={form.status}
                            class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                        >
                            <option value="PENDING">Pending</option>
                            <option value="CONFIRMED">Confirmed</option>
                            <option value="CANCELLED">Cancelled</option>
                            <option value="EXPIRED">Expired</option>
                            <option value="FAILED">Failed</option>
                            <option value="COMPLETED">Completed</option>
                        </select>
                    </div>

                    <!-- Payment Status -->
                    <div class="space-y-2">
                        <label
                            for="payment_status"
                            class="text-sm font-medium text-slate-700 flex items-center gap-2"
                        >
                            <CreditCard size={16} /> Payment Status
                        </label>
                        <select
                            id="payment_status"
                            bind:value={form.payment_status}
                            class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                        >
                            <option value="PENDING">Pending</option>
                            <option value="SUCCESS">Success</option>
                            <option value="FAILED">Failed</option>
                        </select>
                    </div>

                    <div
                        class="col-span-full border-t border-slate-100 my-2"
                    ></div>

                    <!-- Contact Name -->
                    <div class="space-y-2">
                        <label
                            for="fullName"
                            class="text-sm font-medium text-slate-700 flex items-center gap-2"
                        >
                            <User size={16} /> Full Name
                        </label>
                        <input
                            id="fullName"
                            type="text"
                            bind:value={form.contactInfo.fullName}
                            class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                            placeholder="Customer Name"
                        />
                    </div>

                    <!-- Contact Phone -->
                    <div class="space-y-2">
                        <label
                            for="phone"
                            class="text-sm font-medium text-slate-700 flex items-center gap-2"
                        >
                            <Phone size={16} /> Phone
                        </label>
                        <input
                            id="phone"
                            type="text"
                            bind:value={form.contactInfo.phone}
                            class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                            placeholder="Phone Number"
                        />
                    </div>

                    <!-- Contact Email -->
                    <div class="space-y-2 md:col-span-2">
                        <label
                            for="email"
                            class="text-sm font-medium text-slate-700 flex items-center gap-2"
                        >
                            <Mail size={16} /> Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            bind:value={form.contactInfo.email}
                            class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                            placeholder="email@example.com"
                        />
                    </div>

                    <!-- Note -->
                    <div class="space-y-2 md:col-span-2">
                        <label
                            for="note"
                            class="text-sm font-medium text-slate-700 flex items-center gap-2"
                        >
                            <StickyNote size={16} /> Note
                        </label>
                        <textarea
                            id="note"
                            bind:value={form.note}
                            rows="3"
                            class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all resize-none"
                            placeholder="Add a note..."
                        ></textarea>
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
                        <Save size={18} />
                        <span>Update Booking</span>
                    {/if}
                </button>
            </div>
        </div>
    </div>
{/if}
