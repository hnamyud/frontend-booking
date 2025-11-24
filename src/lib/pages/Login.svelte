<script>
    import { auth } from "../stores/auth";
    import { Globe, Eye, EyeOff } from "lucide-svelte";

    let email = "";
    let password = "";
    let showPassword = false;
    let error = "";
    let isLoading = false;

    async function handleLogin() {
        isLoading = true;
        error = "";

        try {
            const response = await fetch(
                "http://localhost:8080/api/v1/auth/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include", // CRITICAL: Required for HttpOnly cookie
                    body: JSON.stringify({ email, password }),
                },
            );

            const data = await response.json();

            if (response.status === 201) {
                const { access_token, user } = data.data;
                let isAdmin = false;
                let adminPermissions = [];

                // Check if user is ADMIN and verify
                if (user.role === "ADMIN") {
                    try {
                        const verifyResponse = await fetch(
                            "http://localhost:8080/api/v1/auth/verify-admin",
                            {
                                method: "POST",
                                headers: {
                                    Authorization: `Bearer ${access_token}`,
                                    "Content-Type": "application/json",
                                },
                            },
                        );

                        if (verifyResponse.status === 201) {
                            const verifyData = await verifyResponse.json();
                            if (verifyData.data.verified) {
                                isAdmin = true;
                                adminPermissions = verifyData.data.permissions;
                            }
                        }
                    } catch (verifyErr) {
                        console.error("Admin verification failed", verifyErr);
                        // Continue as normal user if verification fails
                    }
                }

                auth.login(access_token, user, isAdmin, adminPermissions);
                window.location.href = "/";
            } else {
                error = data.message || "Đăng nhập thất bại";
                alert(error);
            }
        } catch (err) {
            console.error(err);
            error = "Có lỗi xảy ra, vui lòng thử lại sau";
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
