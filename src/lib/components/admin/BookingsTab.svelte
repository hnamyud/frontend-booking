<script>
    import { onMount } from "svelte";
    import { auth } from "../../stores/auth";
    import { api } from "../../api.svelte";
    import {
        Search,
        Edit2,
        Trash2,
        ChevronLeft,
        ChevronRight,
        Calendar,
        User,
        CreditCard,
        AlertCircle,
        QrCode,
    } from "lucide-svelte";
    import BookingModal from "./BookingModal.svelte";

    let bookings = [];
    let loading = false;
    let pagination = {
        current: 1,
        pageSize: 5,
        total: 0,
        pages: 1,
    };

    let showModal = false;
    let selectedBooking = null;
    let isSubmitting = false;

    onMount(() => {
        loadBookings();
    });

    async function loadBookings(page = 1) {
        loading = true;
        try {
            const response = await api.getBookings({
                current: page,
                pageSize: pagination.pageSize,
            });
            bookings = response.data.result;
            // Ensure meta exists, fallback if necessary
            if (response.data.meta) {
                pagination = { ...pagination, ...response.data.meta };
            }
        } catch (error) {
            console.error("Failed to load bookings:", error);
            // Implement toast notification here if available
        } finally {
            loading = false;
        }
    }

    async function handleCheckin() {
        // Use prompt for simplicity or implement a custom modal
        const ticketCode = prompt("Please enter the ticket code:");
        if (!ticketCode) return;

        try {
            const response = await api.verifyTicket(ticketCode);
            // Assuming response structure: { statusCode: 201, message: "...", data: { valid: true, message: "..." } }
            if (response.data && response.data.valid) {
                alert(`✅ ${response.data.message}`);
                loadBookings(pagination.current); // Refresh list
            } else {
                alert(`❌ ${response.data.message || "Invalid ticket"}`);
            }
        } catch (error) {
            console.error("Check-in failed:", error);
            alert("❌ Check-in failed: " + (error.message || "Unknown error"));
        }
    }

    function handleEdit(booking) {
        selectedBooking = booking;
        showModal = true;
    }

    async function handleDelete(id) {
        if (!confirm("Are you sure you want to delete this booking?")) return;

        try {
            await api.deleteBooking(id);
            // Toast success
            loadBookings(pagination.current);
        } catch (error) {
            console.error("Failed to delete booking:", error);
            alert("Failed to delete booking");
        }
    }

    async function handleBookingSubmit(event) {
        isSubmitting = true;
        try {
            await api.updateBooking(selectedBooking._id, event.detail);
            showModal = false;
            loadBookings(pagination.current);
        } catch (error) {
            console.error("Failed to update booking:", error);
            alert("Failed to update booking");
        } finally {
            isSubmitting = false;
        }
    }

    function getStatusColor(status) {
        switch (status) {
            case "CONFIRMED":
                return "bg-emerald-100 text-emerald-700";
            case "PENDING":
                return "bg-amber-100 text-amber-700";
            case "CANCELLED":
            case "FAILED":
            case "EXPIRED":
                return "bg-red-100 text-red-700";
            case "COMPLETED":
                return "bg-blue-100 text-blue-700";
            default:
                return "bg-slate-100 text-slate-700";
        }
    }

    function getPaymentStatusColor(status) {
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

    // Helper to format currency
    function formatCurrency(amount) {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount);
    }
</script>

<div class="space-y-6">
    <div class="flex justify-between items-center">
        <h2 class="text-xl font-bold text-slate-800">Booking Management</h2>
        <div class="flex gap-3">
            {#if $auth.isModerator}
                <button
                    on:click={handleCheckin}
                    class="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
                >
                    <QrCode size={18} />
                    Check-in
                </button>
            {/if}
            <button
                on:click={() => loadBookings(pagination.current)}
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
    {:else if bookings.length === 0}
        <div
            class="flex flex-col items-center justify-center h-64 text-slate-400"
        >
            <Calendar size={48} class="mb-4 opacity-20" />
            <p>No bookings found.</p>
        </div>
    {:else}
        <div class="overflow-x-auto border border-slate-100 rounded-xl">
            <table class="w-full text-left">
                <thead class="bg-slate-50 border-b border-slate-100">
                    <tr>
                        <th class="p-4 font-semibold text-slate-600"
                            >Customer</th
                        >
                        <th class="p-4 font-semibold text-slate-600"
                            >Tour Details</th
                        >
                        <th class="p-4 font-semibold text-slate-600"
                            >Total Price</th
                        >
                        <th class="p-4 font-semibold text-slate-600">Status</th>
                        <th class="p-4 font-semibold text-slate-600">Payment</th
                        >
                        <th class="p-4 font-semibold text-slate-600 text-right"
                            >Actions</th
                        >
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    {#each bookings as booking}
                        <tr class="hover:bg-slate-50 transition-colors">
                            <td class="p-4">
                                <div class="font-medium text-slate-800">
                                    {booking.contactInfo?.fullName || "N/A"}
                                </div>
                                <div
                                    class="text-sm text-slate-500 flex items-center gap-1"
                                >
                                    <User size={12} />
                                    {booking.numberOfGuests} guests
                                </div>
                            </td>
                            <td class="p-4">
                                <div class="text-sm text-slate-600">
                                    <span
                                        class="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded"
                                    >
                                        {booking._id.slice(-6).toUpperCase()}
                                    </span>
                                </div>
                                <div class="text-xs text-slate-400 mt-1">
                                    {new Date(
                                        booking.createdAt,
                                    ).toLocaleDateString()}
                                </div>
                            </td>
                            <td class="p-4 font-medium text-emerald-600">
                                {formatCurrency(booking.totalPrice)}
                            </td>
                            <td class="p-4">
                                <span
                                    class="px-2.5 py-0.5 rounded-full text-xs font-medium {getStatusColor(
                                        booking.status,
                                    )}"
                                >
                                    {booking.status}
                                </span>
                            </td>
                            <td class="p-4">
                                <span
                                    class="px-2.5 py-0.5 rounded-full text-xs font-medium {getPaymentStatusColor(
                                        booking.payment_status,
                                    )}"
                                >
                                    {booking.payment_status}
                                </span>
                            </td>
                            <td class="p-4">
                                <div class="flex justify-end gap-2">
                                    <button
                                        on:click={() => handleEdit(booking)}
                                        class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Edit"
                                        aria-label="Edit booking"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    {#if $auth.isAdmin}
                                        <button
                                            on:click={() =>
                                                handleDelete(booking._id)}
                                            class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete"
                                            aria-label="Delete booking"
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
                    on:click={() => loadBookings(pagination.current - 1)}
                    class="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronLeft size={20} />
                </button>
                <button
                    disabled={pagination.current >= pagination.pages}
                    on:click={() => loadBookings(pagination.current + 1)}
                    class="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronRight size={20} />
                </button>
            </div>
        </div>
    {/if}

    <BookingModal
        isOpen={showModal}
        booking={selectedBooking}
        isLoading={isSubmitting}
        on:close={() => (showModal = false)}
        on:submit={handleBookingSubmit}
    />
</div>
