<script>
    import { onMount } from "svelte";
    import { api } from "../../api.svelte";
    import {
        Search,
        Edit2,
        Trash2,
        ChevronLeft,
        ChevronRight,
        CreditCard,
        AlertCircle,
        DollarSign,
    } from "lucide-svelte";
    import PaymentModal from "./PaymentModal.svelte";

    let payments = [];
    let loading = false;
    let pagination = {
        current: 1,
        pageSize: 5,
        total: 0,
        pages: 1,
    };

    let showModal = false;
    let selectedPayment = null;
    let isSubmitting = false;

    onMount(() => {
        loadPayments();
    });

    async function loadPayments(page = 1) {
        loading = true;
        try {
            const response = await api.getPayments({
                current: page,
                pageSize: pagination.pageSize,
            });
            payments = response.data.result;
            if (response.data.meta) {
                pagination = { ...pagination, ...response.data.meta };
            }
        } catch (error) {
            console.error("Failed to load payments:", error);
        } finally {
            loading = false;
        }
    }

    function handleEdit(payment) {
        selectedPayment = payment;
        showModal = true;
    }

    async function handleDelete(id) {
        if (!confirm("Are you sure you want to delete this payment?")) return;

        try {
            await api.deletePayment(id);
            // Reload current page
            loadPayments(pagination.current);
        } catch (error) {
            console.error("Failed to delete payment:", error);
            alert("Failed to delete payment");
        }
    }

    async function handlePaymentSubmit(event) {
        isSubmitting = true;
        try {
            await api.updatePayment(selectedPayment._id, event.detail);
            showModal = false;
            loadPayments(pagination.current);
        } catch (error) {
            console.error("Failed to update payment:", error);
            alert("Failed to update payment");
        } finally {
            isSubmitting = false;
        }
    }

    function getStatusColor(status) {
        switch (status) {
            case "SUCCESS":
                return "bg-emerald-100 text-emerald-700";
            case "PENDING":
                return "bg-amber-100 text-amber-700";
            case "FAILED":
                return "bg-red-100 text-red-700";
            default:
                return "bg-slate-100 text-slate-700";
        }
    }

    function formatCurrency(amount, currency = "VND") {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: currency,
        }).format(amount);
    }
</script>

<div class="space-y-6">
    <div class="flex justify-between items-center">
        <h2 class="text-xl font-bold text-slate-800">Payment Management</h2>
        <div class="flex gap-3">
            <button
                on:click={() => loadPayments(pagination.current)}
                class="px-4 py-2 text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors font-medium"
            >
                Refresh
            </button>
        </div>
    </div>

    {#if loading}
        <div class="flex items-center justify-center h-64">
            <div
                class="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"
            ></div>
        </div>
    {:else if payments.length === 0}
        <div
            class="flex flex-col items-center justify-center h-64 text-slate-400"
        >
            <CreditCard size={48} class="mb-4 opacity-20" />
            <p>No payments found.</p>
        </div>
    {:else}
        <div class="overflow-x-auto border border-slate-100 rounded-xl">
            <table class="w-full text-left">
                <thead class="bg-slate-50 border-b border-slate-100">
                    <tr>
                        <th class="p-4 font-semibold text-slate-600"
                            >Transaction Code</th
                        >
                        <th class="p-4 font-semibold text-slate-600"
                            >Provider</th
                        >
                        <th class="p-4 font-semibold text-slate-600">Amount</th>
                        <th class="p-4 font-semibold text-slate-600">Status</th>
                        <th class="p-4 font-semibold text-slate-600">User ID</th
                        >
                        <th class="p-4 font-semibold text-slate-600">Date</th>
                        <th class="p-4 font-semibold text-slate-600 text-right"
                            >Actions</th
                        >
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    {#each payments as payment}
                        <tr class="hover:bg-slate-50 transition-colors">
                            <td class="p-4">
                                <span
                                    class="font-mono text-xs bg-slate-100 px-2 py-1 rounded text-slate-600"
                                >
                                    {payment.code}
                                </span>
                            </td>
                            <td class="p-4 text-slate-600">
                                {payment.provider}
                            </td>
                            <td class="p-4 font-medium text-emerald-600">
                                {formatCurrency(
                                    payment.amount,
                                    payment.currency,
                                )}
                            </td>
                            <td class="p-4">
                                <span
                                    class="px-2.5 py-0.5 rounded-full text-xs font-medium {getStatusColor(
                                        payment.status,
                                    )}"
                                >
                                    {payment.status}
                                </span>
                            </td>
                            <td class="p-4 text-xs text-slate-500 font-mono">
                                {payment.user_id}
                            </td>
                            <td class="p-4 text-sm text-slate-500">
                                {new Date(
                                    payment.createdAt,
                                ).toLocaleDateString()}
                            </td>
                            <td class="p-4">
                                <div class="flex justify-end gap-2">
                                    <button
                                        on:click={() => handleEdit(payment)}
                                        class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Edit Status"
                                        aria-label="Edit payment status"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        on:click={() =>
                                            handleDelete(payment._id)}
                                        class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete"
                                        aria-label="Delete payment"
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
        <div class="flex items-center justify-between mt-6">
            <div class="text-sm text-slate-500">
                Showing {(pagination.current - 1) * pagination.pageSize + 1} to {Math.min(
                    pagination.current * pagination.pageSize,
                    pagination.total,
                )} of {pagination.total} results
            </div>
            <div class="flex gap-2">
                <button
                    disabled={pagination.current === 1}
                    on:click={() => loadPayments(pagination.current - 1)}
                    class="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronLeft size={20} />
                </button>
                <button
                    disabled={pagination.current >= pagination.pages}
                    on:click={() => loadPayments(pagination.current + 1)}
                    class="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronRight size={20} />
                </button>
            </div>
        </div>
    {/if}

    <PaymentModal
        isOpen={showModal}
        payment={selectedPayment}
        isLoading={isSubmitting}
        on:close={() => (showModal = false)}
        on:submit={handlePaymentSubmit}
    />
</div>
