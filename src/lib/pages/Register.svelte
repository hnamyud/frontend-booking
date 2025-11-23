<script>
    import { Globe } from "lucide-svelte";

    let formData = {
        name: "",
        email: "",
        password: "",
        birthDay: "",
        gender: "male",
        address: "",
    };
    let error = "";
    let isLoading = false;

    async function handleRegister() {
        isLoading = true;
        error = "";

        try {
            const response = await fetch(
                "http://localhost:8080/api/v1/auth/register",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                },
            );

            const data = await response.json();

            if (response.status === 201) {
                alert("Đăng ký thành công");
                window.location.href = "/login";
            } else {
                error = data.message || "Đăng ký thất bại";
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

<div
    class="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-10"
>
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
                Đăng ký tài khoản
            </h2>

            <form on:submit|preventDefault={handleRegister} class="space-y-4">
                <div>
                    <label
                        for="name"
                        class="block text-sm font-medium text-slate-700 mb-1"
                        >Họ và tên</label
                    >
                    <input
                        type="text"
                        id="name"
                        bind:value={formData.name}
                        required
                        class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                        placeholder="Nguyễn Văn A"
                    />
                </div>

                <div>
                    <label
                        for="email"
                        class="block text-sm font-medium text-slate-700 mb-1"
                        >Email</label
                    >
                    <input
                        type="email"
                        id="email"
                        bind:value={formData.email}
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
                    <input
                        type="password"
                        id="password"
                        bind:value={formData.password}
                        required
                        class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                        placeholder="••••••••"
                    />
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label
                            for="birthDay"
                            class="block text-sm font-medium text-slate-700 mb-1"
                            >Ngày sinh</label
                        >
                        <input
                            type="date"
                            id="birthDay"
                            bind:value={formData.birthDay}
                            required
                            class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label
                            for="gender"
                            class="block text-sm font-medium text-slate-700 mb-1"
                            >Giới tính</label
                        >
                        <select
                            id="gender"
                            bind:value={formData.gender}
                            class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                        >
                            <option value="male">Nam</option>
                            <option value="female">Nữ</option>
                            <option value="other">Khác</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label
                        for="address"
                        class="block text-sm font-medium text-slate-700 mb-1"
                        >Địa chỉ</label
                    >
                    <textarea
                        id="address"
                        bind:value={formData.address}
                        required
                        rows="2"
                        class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                        placeholder="Số nhà, tên đường..."
                    ></textarea>
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
                    {isLoading ? "Đang xử lý..." : "Đăng ký"}
                </button>

                <div class="text-center text-slate-600 text-sm">
                    Đã có tài khoản?
                    <a
                        href="/login"
                        class="text-emerald-600 font-bold hover:underline"
                        >Đăng nhập</a
                    >
                </div>
            </form>
        </div>
    </div>
</div>
