<script>
    import { auth } from "../stores/auth";
    import { Globe, Eye, EyeOff } from "lucide-svelte";

    let email = "";
    let password = "";
    let showPassword = false;
    let error = "";
    let isLoading = false;

    import { api } from "../api.svelte";

    async function handleLogin() {
        isLoading = true;
        error = "";

        try {
            const data = await api.login(email, password);
            const { access_token, user } = data.data;
            let isAdmin = false;
            let isModerator = false;
            let adminPermissions = [];

            // Check if user is ADMIN and verify
            if (user.role === "ADMIN") {
                try {
                    const verifyData = await api.request(
                        "/api/v1/auth/verify-admin",
                        "POST",
                        undefined,
                        {
                            Authorization: `Bearer ${access_token}`,
                        },
                    );

                    if (verifyData.data.verified) {
                        isAdmin = true;
                        adminPermissions = verifyData.data.permissions;
                    }
                } catch (verifyErr) {
                    console.error("Admin verification failed", verifyErr);
                }
            } else if (user.role === "MODERATOR") {
                try {
                    const verifyData = await api.request(
                        "/api/v1/auth/verify-moderator",
                        "POST",
                        undefined,
                        {
                            Authorization: `Bearer ${access_token}`,
                        },
                    );

                    if (verifyData.data.verified) {
                        isModerator = true;
                        // Moderator might have permissions too, but for now we'll assume basic moderator check
                        // adminPermissions = verifyData.data.permissions;
                    }
                } catch (verifyErr) {
                    console.error("Moderator verification failed", verifyErr);
                }
            }

            auth.login(
                access_token,
                user,
                isAdmin,
                isModerator,
                adminPermissions,
            );
            window.location.href = "/";
        } catch (err) {
            console.error(err);
            error = err.message || "Có lỗi xảy ra, vui lòng thử lại sau";
            alert(error);
        } finally {
            isLoading = false;
        }
    }
</script>

<div class="min-h-screen bg-slate-50 flex items-center justify-center p-4">
    <div class="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div class="p-8">
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

            <h2 class="text-2xl font-bold text-center text-slate-800 mb-8">
                Đăng nhập
            </h2>

            <form on:submit|preventDefault={handleLogin} class="space-y-6">
                <div>
                    <label
                        for="email"
                        class="block text-sm font-medium text-slate-700 mb-1"
                        >Email</label
                    >
                    <input
                        type="email"
                        id="email"
                        bind:value={email}
                        required
                        class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                        placeholder="name@example.com"
                    />
                </div>

                <div>
                    <label
                        for="password"
                        class="block text-sm font-medium text-slate-700 mb-1"
                        >Mật khẩu</label
                    >
                    <div class="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            bind:value={password}
                            required
                            class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all pr-10"
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                            on:click={() => (showPassword = !showPassword)}
                        >
                            {#if showPassword}
                                <EyeOff size={20} />
                            {:else}
                                <Eye size={20} />
                            {/if}
                        </button>
                    </div>
                    <div class="flex justify-end mt-2">
                        <a
                            href="/forgot-password"
                            class="text-sm text-emerald-600 hover:underline cursor-pointer"
                        >
                            Quên mật khẩu?
                        </a>
                    </div>
                </div>

                {#if error}
                    <div class="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                        {error}
                    </div>
                {/if}

                <button
                    type="submit"
                    disabled={isLoading}
                    class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isLoading ? "Đang xử lý..." : "Đăng nhập"}
                </button>

                <div class="relative my-6">
                    <div class="absolute inset-0 flex items-center">
                        <div class="w-full border-t border-slate-200"></div>
                    </div>
                    <div class="relative flex justify-center text-sm">
                        <span class="px-2 bg-white text-slate-500"
                            >Hoặc đăng nhập với</span
                        >
                    </div>
                </div>

                <a
                    href="http://localhost:8080/api/v1/auth/google/login"
                    class="w-full flex items-center justify-center gap-3 bg-white text-slate-700 font-bold py-3 rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                >
                    <svg class="w-5 h-5" viewBox="0 0 24 24">
                        <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z"
                        />
                        <path
                            fill="#EA4335"
                            d="M12 4.6c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.09 14.97 0 12 0 7.7 0 3.99 2.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                    </svg>
                    Google
                </a>

                <div class="text-center text-slate-600 text-sm">
                    Chưa có tài khoản?
                    <a
                        href="/register"
                        class="text-emerald-600 font-bold hover:underline"
                        >Đăng ký ngay</a
                    >
                </div>
            </form>
        </div>
    </div>
</div>
