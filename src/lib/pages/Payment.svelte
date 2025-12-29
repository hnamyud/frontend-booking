<script>
    import { onMount } from "svelte";
    import { api } from "../api.svelte";
    import { fade } from "svelte/transition";
    import {
        CreditCard,
        CheckCircle2,
        Shield,
        Calendar,
        Users,
        ArrowLeft,
    } from "lucide-svelte";
    import { auth } from "../stores/auth";

    export let params = {};
    let bookingId = "";
    let booking = null;
    let tour = null;
    let isLoading = true;
    let error = "";
    let isProcessing = false;
    let paymentMethod = "VNPAY";

    let tourIdentifier = "";

    $: if (params && params.id) bookingId = params.id;

    async function fetchBookingDetails() {
        if (!bookingId) return;
        isLoading = true;
        try {
            const res = await api.getBooking(bookingId);
            booking = res.data;

            // Fetch tour details using the identifier from URL (slug or ID)
            // fallback to booking.tour_id if URL identifier is missing
            const tourIdToFetch = tourIdentifier || booking.tour_id;
            if (tourIdToFetch) {
                const tourRes = await api.getTour(tourIdToFetch);
                tour = tourRes.data;
            }
        } catch (err) {
            console.error(err);
            error = "Could not load booking details.";
        } finally {
            isLoading = false;
        }
    }

    onMount(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const queryBookingId = urlParams.get("bookingId");

        const pathParts = window.location.pathname.split("/");
        const idIndex = pathParts.indexOf("payment") + 1;

        if (idIndex > 0 && idIndex < pathParts.length) {
            // This part is now likely the slug (or ID in legacy cases)
            tourIdentifier = pathParts[idIndex];
        }

        if (queryBookingId) {
            bookingId = queryBookingId;
        } else if (!bookingId) {
            // Fallback logic: if no query bookingId, try to interpret path as bookingId
            // (only if it looks like an ID and we didn't treat it as a slug?
            // Actually, to support /payment/:bookingId legacy, if we failed to find bookingId in query,
            // and the path part looks like an ID, we assume it IS the bookingId.
            // But now we prefer it to be tourSlug.
            // Let's stick to: if queryId exists, use it.
            // If queryId missing, check if path looks like MongoID. If so, treat as bookingId.

            if (/^[0-9a-fA-F]{24}$/.test(tourIdentifier)) {
                bookingId = tourIdentifier;
                // If the path IS the bookingId, then tourIdentifier is also that ID.
                // We will fetch tour using booking.tour_id in the fetch function if tourIdentifier === bookingId?
                // Or just let it try fetching tour by bookingId? No, getting tour by bookingID is wrong.
                // So if path is bookingId, we should reset tourIdentifier to null so it falls back to booking.tour_id
                tourIdentifier = "";
            }
        }
        fetchBookingDetails();
    });

    function formatPrice(price) {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price);
    }

    function formatDate(dateStr) {
        if (!dateStr) return "";
        return new Date(dateStr).toLocaleDateString("vi-VN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    }

    async function handlePayment() {
        isProcessing = true;
        try {
            const payload = {
                booking_id: booking._id,
                provider: paymentMethod,
                amount: booking.totalPrice,
                currency: "VND",
            };

            const res = await api.createPayment(payload);
            const { paymentUrl } = res.data;

            if (paymentUrl) {
                window.location.href = paymentUrl;
            } else {
                alert("Failed to create payment URL");
            }
        } catch (err) {
            console.error(err);
            alert("Payment creation failed. Please try again.");
        } finally {
            isProcessing = false;
        }
    }
</script>

<div class="min-h-screen bg-slate-50 pb-20" in:fade>
    <!-- Header -->
    <div class="bg-white border-b border-slate-100 sticky top-0 z-30">
        <div class="container mx-auto px-4 py-4 flex items-center gap-4">
            <button
                on:click={() =>
                    window.dispatchEvent(
                        new CustomEvent("app:navigate", {
                            detail: `/tours`, // Or back to booking/profile
                        }),
                    )}
                class="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
            >
                <ArrowLeft size={24} />
            </button>
            <h1 class="text-xl font-bold text-slate-800">Thanh Toán</h1>
        </div>
    </div>

    <div class="container mx-auto px-4 py-8">
        {#if isLoading}
            <div class="flex justify-center py-20">
                <div
                    class="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"
                ></div>
            </div>
        {:else if error || !booking}
            <div class="text-center py-20 text-red-500 font-medium">
                {error || "Booking not found"}
            </div>
        {:else}
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <!-- Left Column: Payment Methods -->
                <div class="lg:col-span-2 space-y-6">
                    <h2 class="text-xl font-bold text-slate-900">
                        Chọn phương thức thanh toán
                    </h2>

                    <div class="space-y-4">
                        <!-- VNPAY Option -->
                        <label class="block relative cursor-pointer group">
                            <input
                                type="radio"
                                name="payment"
                                value="VNPAY"
                                bind:group={paymentMethod}
                                class="peer sr-only"
                            />
                            <div
                                class="p-4 rounded-xl border-2 border-slate-200 bg-white hover:border-emerald-200 peer-checked:border-emerald-600 peer-checked:bg-emerald-50/30 transition-all flex items-center gap-4"
                            >
                                <div
                                    class="w-6 h-6 rounded-full border-2 border-slate-300 peer-checked:border-emerald-600 peer-checked:bg-emerald-600 flex items-center justify-center transition-colors"
                                >
                                    <div
                                        class="w-2 h-2 bg-white rounded-full opacity-0 peer-checked:opacity-100"
                                    ></div>
                                </div>
                                <div
                                    class="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center p-1"
                                >
                                    <!-- Placeholder VNPAY Logo or text -->
                                    <span
                                        class="text-[10px] font-bold text-blue-600"
                                        >VNPAY</span
                                    >
                                </div>
                                <div>
                                    <div class="font-bold text-slate-900">
                                        Ví VNPAY / VNPAY-QR
                                    </div>
                                    <div class="text-sm text-slate-500">
                                        Thanh toán nhanh chóng qua ứng dụng ngân
                                        hàng
                                    </div>
                                </div>
                            </div>
                        </label>

                        <!-- Add more methods here later -->
                    </div>
                </div>

                <!-- Right Column: Order Summary -->
                <div class="lg:col-span-1">
                    <div class="sticky top-24 space-y-6">
                        <div
                            class="bg-white rounded-2xl shadow-lg shadow-slate-200/50 overflow-hidden border border-slate-100"
                        >
                            <div
                                class="p-6 border-b border-slate-100 bg-slate-50/50"
                            >
                                <h3 class="font-bold text-lg text-slate-900">
                                    Tóm tắt đơn hàng
                                </h3>
                                <div class="text-sm text-slate-500 mt-1">
                                    Mã đơn: #{booking._id.slice(-8)}
                                </div>
                            </div>

                            <div class="p-6 space-y-4">
                                {#if tour}
                                    <div class="flex gap-4">
                                        <img
                                            src={tour.images?.[0]?.url ||
                                                "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80"}
                                            alt={tour.name}
                                            class="w-16 h-16 rounded-lg object-cover bg-slate-100"
                                        />
                                        <div>
                                            <div
                                                class="font-medium text-slate-900 line-clamp-2 text-sm"
                                            >
                                                {tour.name}
                                            </div>
                                            <div
                                                class="text-xs text-slate-500 mt-1"
                                            >
                                                {tour.duration}
                                            </div>
                                        </div>
                                    </div>
                                    <hr class="border-slate-100" />
                                {/if}

                                <div class="space-y-2 text-sm">
                                    <div class="flex justify-between">
                                        <span class="text-slate-500"
                                            >Khởi hành</span
                                        >
                                        <span class="font-medium text-slate-900"
                                            >{formatDate(
                                                booking.startDate ||
                                                    tour?.timeStart,
                                            )}</span
                                        >
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-slate-500"
                                            >Số khách</span
                                        >
                                        <span class="font-medium text-slate-900"
                                            >{booking.numberOfGuests} người</span
                                        >
                                    </div>
                                </div>

                                <div
                                    class="border-t border-slate-100 pt-4 flex justify-between items-center"
                                >
                                    <span class="font-bold text-slate-900"
                                        >Tổng thanh toán</span
                                    >
                                    <span
                                        class="text-2xl font-bold text-emerald-600"
                                        >{formatPrice(booking.totalPrice)}</span
                                    >
                                </div>

                                <button
                                    on:click={handlePayment}
                                    disabled={isProcessing}
                                    class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                                >
                                    {#if isProcessing}
                                        <div
                                            class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"
                                        ></div>
                                        <span>Đang xử lý...</span>
                                    {:else}
                                        <span>Thanh toán ngay</span>
                                    {/if}
                                </button>

                                <div
                                    class="flex items-center justify-center gap-2 text-xs text-slate-400"
                                >
                                    <Shield size={12} />
                                    Bảo mật thanh toán 100%
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        {/if}
    </div>
</div>
