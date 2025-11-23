<script>
    import {
        Globe,
        Mail,
        Key,
        Lock,
        Eye,
        EyeOff,
        ArrowLeft,
    } from "lucide-svelte";
    import { fade, slide } from "svelte/transition";

    let currentStep = 1;
    let isLoading = false;
    let error = "";

    // Form data persisted across steps
    let email = "";
    let otp = "";
    let newPassword = "";
    let confirmPassword = "";
    let showPassword = false;
    let showConfirmPassword = false;

    async function handleSendOTP() {
        if (!email) {
            error = "Vui lòng nhập email";
            return;
        }

        isLoading = true;
        error = "";

        try {
            const response = await fetch(
                "http://localhost:8080/api/v1/mail/reset-password",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email }),
                },
            );

            const data = await response.json();

            if (response.status === 201) {
                currentStep = 2;
            } else {
                error = data.message || "Gửi mã OTP thất bại";
            }
        } catch (err) {
            console.error(err);
            error = "Có lỗi xảy ra, vui lòng thử lại sau";
        } finally {
            isLoading = false;
        }
    }

    async function handleVerifyOTP() {
        if (!otp) {
            error = "Vui lòng nhập mã OTP";
            return;
        }

        isLoading = true;
        error = "";

        try {
            const response = await fetch(
                "http://localhost:8080/api/v1/auth/verify-otp",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email, otp }),
                },
            );

            const data = await response.json();

            if (response.status === 201) {
                currentStep = 3;
            } else {
                error = data.message || "Mã OTP không hợp lệ";
            }
        } catch (err) {
            console.error(err);
            error = "Có lỗi xảy ra, vui lòng thử lại sau";
        } finally {
            isLoading = false;
        }
    }

    async function handleResetPassword() {
        if (!newPassword || !confirmPassword) {
            error = "Vui lòng nhập đầy đủ thông tin";
            return;
        }

        if (newPassword !== confirmPassword) {
            error = "Mật khẩu xác nhận không khớp";
            return;
        }

        if (newPassword.length < 6) {
            error = "Mật khẩu phải có ít nhất 6 ký tự";
            return;
        }

        isLoading = true;
        error = "";

        try {
            const response = await fetch(
                "http://localhost:8080/api/v1/auth/reset-password",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email, otp, newPassword }),
                },
            );

            const data = await response.json();

            if (response.status === 201) {
                alert("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
                window.location.href = "/login";
            } else {
                error = data.message || "Đổi mật khẩu thất bại";
            }
        } catch (err) {
            console.error(err);
            error = "Có lỗi xảy ra, vui lòng thử lại sau";
        } finally {
            isLoading = false;
        }
    }
</script>

<div class="min-h-screen bg-slate-50 flex items-center justify-center p-4">
    <div class="max-w-md w-full">
        <!-- Back Button -->
        <a
            href="/login"
            class="inline-flex items-center gap-2 text-slate-600 hover:text-emerald-600 font-medium mb-6 transition-colors group"
        >
            <ArrowLeft
                size={20}
                class="group-hover:-translate-x-1 transition-transform"
            />
            <span>Quay lại đăng nhập</span>
        </a>

        <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div class="p-8">
                <!-- Logo -->
                <div class="flex justify-center mb-8">
                    <a href="/" class="flex items-center gap-2 group">
                        <div
                            class="bg-emerald-600 text-white p-2 rounded-lg group-hover:bg-emerald-700 transition-colors"
                        >
                            <Globe size={24} />
                        </div>
                        <span
                            class="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-sky-600 bg-clip-text text-transparent"
                        >
                            TravelVibe
                        </span>
                    </a>
                </div>

                <h2 class="text-2xl font-bold text-center text-slate-800 mb-2">
                    Quên mật khẩu
                </h2>
                <p class="text-center text-slate-500 text-sm mb-8">
                    Bước {currentStep} / 3
                </p>

                <!-- Step 1: Enter Email -->
                {#if currentStep === 1}
                    <div transition:slide={{ duration: 300 }}>
                        <p class="text-slate-600 text-sm mb-6 text-center">
                            Nhập email của bạn để nhận mã OTP
                        </p>
                        <form
                            on:submit|preventDefault={handleSendOTP}
                            class="space-y-6"
                        >
                            <div>
                                <label
                                    for="email"
                                    class="block text-sm font-medium text-slate-700 mb-1"
                                    >Email</label
                                >
                                <div class="relative">
                                    <Mail
                                        class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                        size={20}
                                    />
                                    <input
                                        type="email"
                                        id="email"
                                        bind:value={email}
                                        required
                                        class="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                                        placeholder="name@example.com"
                                    />
                                </div>
                            </div>

                            {#if error}
                                <div
                                    class="p-3 bg-red-50 text-red-600 text-sm rounded-lg"
                                >
                                    {error}
                                </div>
                            {/if}

                            <button
                                type="submit"
                                disabled={isLoading}
                                class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? "Đang gửi..." : "Gửi mã OTP"}
                            </button>
                        </form>
                    </div>
                {/if}

                <!-- Step 2: Verify OTP -->
                {#if currentStep === 2}
                    <div transition:slide={{ duration: 300 }}>
                        <p class="text-slate-600 text-sm mb-6 text-center">
                            Nhập mã OTP đã được gửi đến <strong>{email}</strong>
                        </p>
                        <form
                            on:submit|preventDefault={handleVerifyOTP}
                            class="space-y-6"
                        >
                            <div>
                                <label
                                    for="otp"
                                    class="block text-sm font-medium text-slate-700 mb-1"
                                    >Mã OTP</label
                                >
                                <div class="relative">
                                    <Key
                                        class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                        size={20}
                                    />
                                    <input
                                        type="text"
                                        id="otp"
                                        bind:value={otp}
                                        required
                                        maxlength="6"
                                        class="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all tracking-widest text-center text-lg font-semibold"
                                        placeholder="000000"
                                    />
                                </div>
                            </div>

                            {#if error}
                                <div
                                    class="p-3 bg-red-50 text-red-600 text-sm rounded-lg"
                                >
                                    {error}
                                </div>
                            {/if}

                            <button
                                type="submit"
                                disabled={isLoading}
                                class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? "Đang xác thực..." : "Xác thực"}
                            </button>

                            <button
                                type="button"
                                on:click={() => (currentStep = 1)}
                                class="w-full text-slate-600 text-sm hover:text-emerald-600 transition-colors"
                            >
                                Gửi lại mã OTP
                            </button>
                        </form>
                    </div>
                {/if}

                <!-- Step 3: Reset Password -->
                {#if currentStep === 3}
                    <div transition:slide={{ duration: 300 }}>
                        <p class="text-slate-600 text-sm mb-6 text-center">
                            Nhập mật khẩu mới của bạn
                        </p>
                        <form
                            on:submit|preventDefault={handleResetPassword}
                            class="space-y-6"
                        >
                            <!-- New Password -->
                            <div>
                                <label
                                    for="newPassword"
                                    class="block text-sm font-medium text-slate-700 mb-1"
                                    >Mật khẩu mới</label
                                >
                                <div class="relative">
                                    <Lock
                                        class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                        size={20}
                                    />
                                    <input
                                        type={showPassword
                                            ? "text"
                                            : "password"}
                                        id="newPassword"
                                        bind:value={newPassword}
                                        required
                                        minlength="6"
                                        class="w-full pl-10 pr-12 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                        on:click={() =>
                                            (showPassword = !showPassword)}
                                    >
                                        {#if showPassword}
                                            <EyeOff size={20} />
                                        {:else}
                                            <Eye size={20} />
                                        {/if}
                                    </button>
                                </div>
                            </div>

                            <!-- Confirm Password -->
                            <div>
                                <label
                                    for="confirmPassword"
                                    class="block text-sm font-medium text-slate-700 mb-1"
                                    >Xác nhận mật khẩu</label
                                >
                                <div class="relative">
                                    <Lock
                                        class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                        size={20}
                                    />
                                    <input
                                        type={showConfirmPassword
                                            ? "text"
                                            : "password"}
                                        id="confirmPassword"
                                        bind:value={confirmPassword}
                                        required
                                        minlength="6"
                                        class="w-full pl-10 pr-12 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                        on:click={() =>
                                            (showConfirmPassword =
                                                !showConfirmPassword)}
                                    >
                                        {#if showConfirmPassword}
                                            <EyeOff size={20} />
                                        {:else}
                                            <Eye size={20} />
                                        {/if}
                                    </button>
                                </div>
                            </div>

                            {#if error}
                                <div
                                    class="p-3 bg-red-50 text-red-600 text-sm rounded-lg"
                                >
                                    {error}
                                </div>
                            {/if}

                            <button
                                type="submit"
                                disabled={isLoading}
                                class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? "Đang xử lý..." : "Đổi mật khẩu"}
                            </button>
                        </form>
                    </div>
                {/if}
            </div>
        </div>
    </div>
</div>
