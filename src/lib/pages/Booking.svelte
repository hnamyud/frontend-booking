<script>
    import { onMount } from "svelte";
    import { api } from "../api.svelte";
    import { fade, slide } from "svelte/transition";
    import {
        Calendar,
        Users,
        MapPin,
        ArrowLeft,
        Check,
        AlertCircle,
        CreditCard,
        Info,
    } from "lucide-svelte";
    import { auth } from "../stores/auth";

    export let params = {};
    let tourId = "";
    let tour = null;
    let isLoading = true;
    let error = "";
    let isSubmitting = false;

    // Form Data
    let guests = 1;
    let fullName = "";
    let phone = "";
    let email = "";
    let note = "";

    // Chips
    const chips = ["Ăn chay", "Có người già/trẻ em", "Dị ứng"];

    // Validation
    let formErrors = {};

    let selectedDate = "";

    $: if (params && params.id) tourId = params.id;
    $: totalPrice = tour ? tour.price * guests : 0;

    // Voucher Logic
    let voucherCode = "";
    let promotion = null;
    let isCheckingVoucher = false;
    let voucherError = "";
    let discountAmount = 0;

    $: if (promotion && totalPrice > 0) {
        if (promotion.discountType === "PERCENTAGE") {
            const calculated = (totalPrice * promotion.discountValue) / 100;
            discountAmount = promotion.maxDiscountAmount
                ? Math.min(calculated, promotion.maxDiscountAmount)
                : calculated;
        } else {
            discountAmount = promotion.discountValue;
        }

        // Re-validate min booking value if price changes (e.g. guest count changed)
        if (totalPrice < promotion.minBookingValue) {
            promotion = null;
            discountAmount = 0;
            voucherError = `Đơn hàng chưa đạt giá trị tối thiểu ${formatPrice(promotion?.minBookingValue || 0)}`;
        }
    } else {
        discountAmount = 0;
    }

    $: finalPrice = Math.max(0, totalPrice - discountAmount);

    // Derive effective start date: selected param > tour start

    $: effectiveStartDate = selectedDate || tour?.timeStart || "";

    // Prefill user data if logged in
    $: if ($auth.user) {
        if (!fullName) fullName = $auth.user.name || "";
        if (!email) email = $auth.user.email || "";
    }

    async function fetchTour() {
        if (!tourId) return;
        isLoading = true;
        try {
            const res = await api.getTour(tourId);
            tour = res.data;
        } catch (err) {
            console.error(err);
            error = "Could not load tour details.";
        } finally {
            isLoading = false;
        }
    }

    onMount(() => {
        // Parse Query Params
        const urlParams = new URLSearchParams(window.location.search);
        const paramGuests = urlParams.get("guests");
        const paramDate = urlParams.get("date");

        if (paramGuests) {
            const parsedGuests = parseInt(paramGuests);
            if (!isNaN(parsedGuests) && parsedGuests > 0) {
                guests = parsedGuests;
            }
        }
        if (paramDate) {
            selectedDate = paramDate;
        }

        if (!tourId) {
            // Fallback parsing if needed, similar to TourDetail
            const pathParts = window.location.pathname.split("/");
            const idIndex = pathParts.indexOf("booking") + 1;
            if (idIndex > 0 && idIndex < pathParts.length) {
                tourId = pathParts[idIndex];
            }
        }
        fetchTour();
    });

    function toggleChip(chip) {
        // Append to note
        if (note) {
            note += `, ${chip}`;
        } else {
            note = chip;
        }
    }

    function formatPrice(price) {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price);
    }

    function formatDate(dateStr) {
        if (!dateStr) return "";
        return new Date(dateStr).toLocaleDateString("vi-VN", {
            weekday: "short",
            day: "numeric",
            month: "numeric",
            year: "numeric",
        });
    }

    async function applyVoucher() {
        if (!voucherCode.trim()) return;
        isCheckingVoucher = true;
        voucherError = "";
        promotion = null;

        try {
            const res = await api.getPromotion(voucherCode);
            const promo = res.data;

            if (!promo.isActive)
                throw new Error("Mã giảm giá đã hết hạn hoặc không hoạt động");
            // Add date check if needed, though API might handle it.
            // Ideally API handles logic, but let's be safe or rely on API response message if 400.
            // Assuming API returns 200 with data if valid, or error if not.

            if (totalPrice < promo.minBookingValue) {
                throw new Error(
                    `Đơn hàng tối thiểu ${formatPrice(promo.minBookingValue)}`,
                );
            }

            promotion = promo;
            // Clear error if success
        } catch (err) {
            console.error(err);
            voucherError = err.message || "Mã giảm giá không hợp lệ";
            promotion = null;
        } finally {
            isCheckingVoucher = false;
        }
    }

    function removeVoucher() {
        promotion = null;
        voucherCode = "";
        voucherError = "";
    }

    function validate() {
        const errors = {};
        if (!fullName.trim()) errors.fullName = "Họ tên không được để trống";
        if (!phone.trim()) {
            errors.phone = "Số điện thoại không được để trống";
        } else if (!/^\d{10}$/.test(phone.trim())) {
            errors.phone = "Số điện thoại phải có 10 chữ số";
        }
        if (!email.trim()) {
            errors.email = "Email không được để trống";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.email = "Email không hợp lệ";
        }
        formErrors = errors;
        return Object.keys(errors).length === 0;
    }

    async function handleSubmit() {
        if (!validate()) return;
        isSubmitting = true;

        try {
            const payload = {
                tour_id: tour._id,
                numberOfGuests: guests,
                contactInfo: {
                    fullName,
                    phone,
                    email,
                },
                note,
                startDate: effectiveStartDate, // Using selected effective date
                ...(promotion ? { code: promotion.code } : {}),
            };

            const res = await api.createBooking(payload);
            const bookingId = res.data?._id || res.data?.id; // Handle potential ID field names

            if (bookingId) {
                window.dispatchEvent(
                    new CustomEvent("app:navigate", {
                        detail: `/payment/${tour.slug || tour._id}?bookingId=${bookingId}`,
                    }),
                );
            } else {
                alert("Booking created but ID missing. Check console.");
                console.log("Booking response:", res);
                // Fallback or just stay?
            }
        } catch (err) {
            console.error(err);
            alert(err.message || "Có lỗi xảy ra khi đặt tour");
        } finally {
            isSubmitting = false;
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
                            detail: `/tours/${tour?.slug || tourId}`, // Use slug if available for clearer URL history
                        }),
                    )}
                class="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
            >
                <ArrowLeft size={24} />
            </button>
            <h1 class="text-xl font-bold text-slate-800">Đặt Tour</h1>
        </div>
    </div>

    <div class="container mx-auto px-4 py-8">
        {#if isLoading}
            <div class="flex justify-center py-20">
                <div
                    class="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"
                ></div>
            </div>
        {:else if error || !tour}
            <div class="text-center py-20 text-red-500 font-medium">
                {error || "Tour not found"}
            </div>
        {:else}
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <!-- Left Column: Form -->
                <div class="lg:col-span-2 space-y-8">
                    <!-- Contact Info -->
                    <div
                        class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
                    >
                        <div class="flex items-center gap-3 mb-6">
                            <div
                                class="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600"
                            >
                                <Users size={20} />
                            </div>
                            <h2 class="text-xl font-bold text-slate-900">
                                Thông tin liên lạc
                            </h2>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div class="space-y-2 md:col-span-2">
                                <label
                                    for="fullName"
                                    class="text-sm font-semibold text-slate-700"
                                    >Họ và tên <span class="text-red-500"
                                        >*</span
                                    ></label
                                >
                                <input
                                    id="fullName"
                                    type="text"
                                    bind:value={fullName}
                                    placeholder="Nguyễn Văn A"
                                    class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                                    class:border-red-500={formErrors.fullName}
                                />
                                {#if formErrors.fullName}
                                    <p class="text-red-500 text-xs">
                                        {formErrors.fullName}
                                    </p>
                                {/if}
                            </div>

                            <div class="space-y-2">
                                <label
                                    for="email"
                                    class="text-sm font-semibold text-slate-700"
                                    >Email <span class="text-red-500">*</span
                                    ></label
                                >
                                <input
                                    id="email"
                                    type="email"
                                    bind:value={email}
                                    placeholder="example@email.com"
                                    class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                                    class:border-red-500={formErrors.email}
                                />
                                {#if formErrors.email}
                                    <p class="text-red-500 text-xs">
                                        {formErrors.email}
                                    </p>
                                {/if}
                            </div>

                            <div class="space-y-2">
                                <label
                                    for="phone"
                                    class="text-sm font-semibold text-slate-700"
                                    >Số điện thoại <span class="text-red-500"
                                        >*</span
                                    ></label
                                >
                                <input
                                    id="phone"
                                    type="tel"
                                    bind:value={phone}
                                    placeholder="0912345678"
                                    class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                                    class:border-red-500={formErrors.phone}
                                />
                                {#if formErrors.phone}
                                    <p class="text-red-500 text-xs">
                                        {formErrors.phone}
                                    </p>
                                {/if}
                            </div>
                        </div>
                    </div>

                    <!-- Special Requests -->
                    <div
                        class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
                    >
                        <div class="flex items-center gap-3 mb-6">
                            <div
                                class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"
                            >
                                <Info size={20} />
                            </div>
                            <h2 class="text-xl font-bold text-slate-900">
                                Yêu cầu đặc biệt
                            </h2>
                        </div>

                        <div class="space-y-4">
                            <div class="flex flex-wrap gap-2">
                                {#each chips as chip}
                                    <button
                                        type="button"
                                        class="px-4 py-2 rounded-full border border-slate-200 hover:bg-slate-50 hover:border-emerald-500 hover:text-emerald-600 transition-all text-sm font-medium text-slate-600"
                                        on:click={() => toggleChip(chip)}
                                    >
                                        + {chip}
                                    </button>
                                {/each}
                            </div>

                            <textarea
                                bind:value={note}
                                rows="4"
                                placeholder="Nhập ghi chú của bạn tại đây..."
                                class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all resize-none"
                            ></textarea>
                            <p class="text-xs text-slate-500">
                                Chúng tôi sẽ cố gắng đáp ứng yêu cầu của bạn
                                nhưng không thể đảm bảo 100%.
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Right Column: Summary (Sidebar) -->
                <div class="lg:col-span-1">
                    <div class="sticky top-24 space-y-6">
                        <div
                            class="bg-white rounded-2xl shadow-lg shadow-slate-200/50 overflow-hidden border border-slate-100"
                        >
                            <!-- Tour Header -->
                            <div class="relative h-32">
                                <img
                                    src={tour.images?.[0]?.url ||
                                        tour.destinations?.[0]?.images?.[0]
                                            ?.url ||
                                        "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80"}
                                    alt="Tour thumbnail"
                                    class="w-full h-full object-cover"
                                />
                                <div
                                    class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"
                                ></div>
                                <div
                                    class="absolute bottom-4 left-4 right-4 text-white"
                                >
                                    <h3
                                        class="font-bold text-lg leading-tight line-clamp-2"
                                    >
                                        {tour.name}
                                    </h3>
                                </div>
                            </div>

                            <div class="p-6 space-y-6">
                                <!-- Info Rows -->
                                <div class="space-y-4">
                                    <div
                                        class="flex justify-between items-center py-2 border-b border-slate-50"
                                    >
                                        <span
                                            class="text-slate-500 flex items-center gap-2 text-sm"
                                        >
                                            <Calendar size={16} /> Khởi hành
                                        </span>
                                        <span
                                            class="font-medium text-slate-800 text-sm"
                                            >{formatDate(tour.timeStart)}</span
                                        >
                                    </div>

                                    <div
                                        class="flex justify-between items-center py-2 border-b border-slate-50"
                                    >
                                        <span
                                            class="text-slate-500 flex items-center gap-2 text-sm"
                                        >
                                            <Users size={16} /> Số khách
                                        </span>
                                        <div class="flex items-center gap-3">
                                            <button
                                                class="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-600 disabled:opacity-50"
                                                disabled={guests <= 1}
                                                on:click={() => guests--}
                                            >
                                                -
                                            </button>
                                            <span
                                                class="font-bold text-slate-900 w-4 text-center"
                                                >{guests}</span
                                            >
                                            <button
                                                class="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-600 disabled:opacity-50"
                                                disabled={guests >=
                                                    tour.availableSlots}
                                                on:click={() => guests++}
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <!-- Price Breakdown -->
                                <div
                                    class="bg-slate-50 p-4 rounded-xl space-y-3"
                                >
                                    <div
                                        class="flex justify-between text-sm text-slate-600"
                                    >
                                        <span>Giá vé</span>
                                        <span
                                            >{formatPrice(tour.price)} x {guests}</span
                                        >
                                    </div>

                                    <!-- Voucher Section -->
                                    <div
                                        class="py-2 border-t border-slate-200/60 space-y-2"
                                    >
                                        {#if !promotion}
                                            <div class="flex gap-2">
                                                <input
                                                    type="text"
                                                    bind:value={voucherCode}
                                                    placeholder="Mã giảm giá"
                                                    class="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-emerald-500 focus:outline-none uppercase"
                                                    on:keydown={(e) =>
                                                        e.key === "Enter" &&
                                                        applyVoucher()}
                                                />
                                                <button
                                                    on:click={applyVoucher}
                                                    disabled={isCheckingVoucher ||
                                                        !voucherCode}
                                                    class="px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg hover:bg-slate-700 disabled:opacity-50 transition-colors"
                                                >
                                                    {isCheckingVoucher
                                                        ? "..."
                                                        : "Áp dụng"}
                                                </button>
                                            </div>
                                            {#if voucherError}
                                                <p class="text-xs text-red-500">
                                                    {voucherError}
                                                </p>
                                            {/if}
                                        {:else}
                                            <div
                                                class="flex justify-between items-center text-sm text-emerald-600 bg-emerald-50 p-2 rounded-lg border border-emerald-100"
                                            >
                                                <span
                                                    class="flex items-center gap-1 font-medium"
                                                >
                                                    <Check size={14} />
                                                    {promotion.code}
                                                </span>
                                                <button
                                                    on:click={removeVoucher}
                                                    class="text-xs text-slate-400 hover:text-red-500"
                                                    >Xóa</button
                                                >
                                            </div>
                                        {/if}
                                    </div>

                                    {#if discountAmount > 0}
                                        <div
                                            class="flex justify-between text-sm text-emerald-600 font-medium"
                                        >
                                            <span>Giảm giá</span>
                                            <span
                                                >-{formatPrice(
                                                    discountAmount,
                                                )}</span
                                            >
                                        </div>
                                    {/if}

                                    <div
                                        class="border-t border-slate-200 pt-3 flex justify-between items-center"
                                    >
                                        <span class="font-bold text-slate-900"
                                            >Tổng cộng</span
                                        >
                                        <div class="text-right">
                                            {#if discountAmount > 0}
                                                <span
                                                    class="block text-xs text-slate-400 line-through font-normal"
                                                    >{formatPrice(
                                                        totalPrice,
                                                    )}</span
                                                >
                                            {/if}
                                            <span
                                                class="text-xl font-bold text-emerald-600"
                                                >{formatPrice(finalPrice)}</span
                                            >
                                        </div>
                                    </div>
                                </div>

                                <!-- Submit Button -->
                                <button
                                    on:click={handleSubmit}
                                    disabled={isSubmitting}
                                    class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                                >
                                    {#if isSubmitting}
                                        <div
                                            class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"
                                        ></div>
                                        <span>Đang xử lý...</span>
                                    {:else}
                                        <span>Xác nhận đặt tour</span>
                                    {/if}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        {/if}
    </div>
</div>
