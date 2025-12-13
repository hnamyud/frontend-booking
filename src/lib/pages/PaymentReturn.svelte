<script>
    import { onMount } from "svelte";
    import { api } from "../api.svelte";
    import { fade, scale } from "svelte/transition";
    import {
        Check,
        X,
        Receipt,
        Clock,
        CreditCard,
        ArrowLeft,
        Home,
        Download,
    } from "lucide-svelte";

    let isLoading = true;
    let isSuccess = false;
    let message = "";
    let paymentData = null;
    let error = "";

    onMount(async () => {
        // Get query string from URL
        const query = window.location.search;

        if (!query) {
            isLoading = false;
            error = "Invalid return URL";
            return;
        }

        try {
            const res = await api.verifyVnpayReturn(query);

            if (res.data && res.data.isSuccess) {
                isSuccess = true;
                message = res.data.message;
                paymentData = res.data.payment;
            } else {
                isSuccess = false;
                message = res.data?.message || "Transaction failed";
            }
        } catch (err) {
            console.error(err);
            isSuccess = false;
            error = err.message || "An error occurred during verification";
        } finally {
            isLoading = false;
        }
    });

    function formatPrice(price) {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price);
    }

    function formatDate(dateStr) {
        if (!dateStr) return "";
        return new Date(dateStr).toLocaleString("vi-VN", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    function handleBackToHome() {
        window.dispatchEvent(new CustomEvent("app:navigate", { detail: "/" }));
    }
</script>

<div
    class="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8"
>
    {#if isLoading}
        <div class="flex flex-col items-center justify-center space-y-4">
            <div
                class="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"
            ></div>
            <p class="text-slate-600 font-medium animate-pulse">
                Đang xác thực giao dịch...
            </p>
        </div>
    {:else}
        <div class="max-w-md w-full mx-auto space-y-8" in:fade>
            <!-- Header Area -->
            <div class="text-center">
                {#if isSuccess}
                    <div
                        class="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-emerald-100 mb-6"
                        in:scale={{ duration: 500, start: 0.5 }}
                    >
                        <Check size={48} class="text-emerald-600" />
                    </div>
                    <h2 class="text-3xl font-extrabold text-slate-900 mb-2">
                        Thanh toán thành công!
                    </h2>
                    <p class="text-lg text-slate-600">
                        {message ||
                            "Cảm ơn bạn đã đặt tour. Vé điện tử đã được gửi đến email của bạn."}
                    </p>
                {:else}
                    <div
                        class="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-red-100 mb-6"
                        in:scale={{ duration: 500, start: 0.5 }}
                    >
                        <X size={48} class="text-red-600" />
                    </div>
                    <h2 class="text-3xl font-extrabold text-slate-900 mb-2">
                        Thanh toán thất bại
                    </h2>
                    <p class="text-lg text-slate-600">
                        {error ||
                            message ||
                            "Vui lòng thử lại hoặc liên hệ hỗ trợ."}
                    </p>
                {/if}
            </div>

            <!-- Digital Receipt Card -->
            {#if isSuccess && paymentData}
                <div
                    class="bg-white py-8 px-6 shadow-xl rounded-2xl border border-slate-100 relative overflow-hidden"
                >
                    <!-- Decorative jagged edge at top/bottom could go here css-wise, keeping simple for now -->
                    <div class="relative z-10 space-y-6">
                        <div
                            class="flex items-center justify-center gap-2 text-slate-400 text-sm uppercase tracking-wider font-semibold"
                        >
                            <Receipt size={16} /> Biên lai điện tử
                        </div>

                        <div
                            class="space-y-4 pb-6 border-b border-dashed border-slate-200"
                        >
                            <div class="flex justify-between items-center">
                                <span class="text-slate-500">Mã giao dịch</span>
                                <span
                                    class="font-mono font-medium text-slate-900"
                                    >{paymentData.code ||
                                        paymentData._id
                                            .slice(-8)
                                            .toUpperCase()}</span
                                >
                            </div>
                            <div class="flex justify-between items-center">
                                <span
                                    class="text-slate-500 flex items-center gap-2"
                                    ><Clock size={14} /> Thời gian</span
                                >
                                <span class="font-medium text-slate-900"
                                    >{formatDate(
                                        paymentData.updatedAt ||
                                            paymentData.createdAt,
                                    )}</span
                                >
                            </div>
                            <div class="flex justify-between items-center">
                                <span
                                    class="text-slate-500 flex items-center gap-2"
                                    ><CreditCard size={14} /> Phương thức</span
                                >
                                <span class="font-medium text-slate-900"
                                    >{paymentData.provider}</span
                                >
                            </div>
                        </div>

                        <div class="flex justify-between items-center pt-2">
                            <span class="text-slate-500 font-medium"
                                >Tổng thanh toán</span
                            >
                            <span class="text-2xl font-bold text-emerald-600"
                                >{formatPrice(paymentData.amount)}</span
                            >
                        </div>

                        <div
                            class="bg-emerald-50 rounded-lg p-3 text-center text-emerald-700 text-sm font-medium"
                        >
                            Trạng thái: {paymentData.status}
                        </div>
                    </div>

                    <!-- Decorative circles for "ticket" look -->
                    <div
                        class="absolute top-1/2 -left-3 w-6 h-6 bg-slate-50 rounded-full"
                    ></div>
                    <div
                        class="absolute top-1/2 -right-3 w-6 h-6 bg-slate-50 rounded-full"
                    ></div>
                </div>
            {/if}

            <!-- Actions -->
            <div class="flex gap-4 justify-center">
                <button
                    on:click={handleBackToHome}
                    class="flex items-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition-all"
                >
                    <Home size={20} />
                    Về trang chủ
                </button>
                {#if !isSuccess}
                    <button
                        on:click={() => window.history.back()}
                        class="flex items-center gap-2 px-6 py-3 border border-slate-200 text-base font-medium rounded-xl text-slate-700 bg-white hover:bg-slate-50 transition-all"
                    >
                        Thử lại
                    </button>
                {/if}
            </div>
        </div>
    {/if}
</div>
