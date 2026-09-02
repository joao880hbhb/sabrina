import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { UserRole, UserAccount, UserSettings } from "../../types";
import {
  Users,
  ShieldCheck,
  Plus,
  Check,
  X,
  Lock,
  Unlock,
  UserCheck,
  Crown,
  ShoppingBag,
  Boxes,
  Scissors,
  Wallet,
  Sparkles,
  Phone,
  Mail,
  Settings,
  Bell,
  Warehouse,
  Sliders,
  CheckCircle2,
  Edit2,
} from "lucide-react";

export const UserManagement: React.FC = () => {
  const {
    currentUser,
    users,
    switchUserRole,
    loginWithEmailPassword,
    addUser,
    updateUserPermissions,
    updateUserSettings,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    "users" | "settings" | "permissions"
  >("users");
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditSettingsModal, setShowEditSettingsModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] =
    useState<UserAccount | null>(null);
  const [loginTargetUser, setLoginTargetUser] = useState<UserAccount | null>(
    null,
  );
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState("");

  const [settingsForm, setSettingsForm] = useState<UserSettings>({
    defaultWarehouse: "Gudang Utama Pusat",
    enableStockAlerts: true,
    enableEscrowAlerts: true,
    enableProductionAlerts: true,
    autoRefreshStock: true,
    minStockBufferPercent: 25,
    notificationSound: true,
    compactTableMode: false,
  });

  const [newUserData, setNewUserData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "admin" as UserRole,
  });

  // Permission Matrix Definition
  const permissionsMatrix = [
    {
      module: "1. Dashboard Owner (Omzet, Laba, Kas & Saldo)",
      owner: true,
      admin: false,
      gudang: false,
      produksi: false,
      finance: true,
      marketing: true,
    },
    {
      module: "2. Penjualan Marketplace (Shopee, TikTok, Tokped, Import CSV)",
      owner: true,
      admin: true,
      gudang: false,
      produksi: false,
      finance: true,
      marketing: true,
    },
    {
      module: "3. Produk & Master HPP (Breakdown Kain, Jahit, Packaging)",
      owner: true,
      admin: true,
      gudang: false,
      produksi: true,
      finance: true,
      marketing: false,
    },
    {
      module: "4. Inventory (Bahan Baku, Stok Gudang, Stock Opname)",
      owner: true,
      admin: true,
      gudang: true,
      produksi: true,
      finance: false,
      marketing: false,
    },
    {
      module: "5. Produksi & SPK (Potong Kain, Jahit Konveksi, QC Reject)",
      owner: true,
      admin: false,
      gudang: true,
      produksi: true,
      finance: false,
      marketing: false,
    },
    {
      module:
        "6. Keuangan (Buku Kas, Mutasi Bank, Laba Rugi P&L, Hutang Supplier)",
      owner: true,
      admin: false,
      gudang: false,
      produksi: false,
      finance: true,
      marketing: false,
    },
    {
      module: "7. Surat Jalan (Kirim Penjahit, Gudang, Reseller)",
      owner: true,
      admin: true,
      gudang: true,
      produksi: true,
      finance: false,
      marketing: false,
    },
    {
      module: "8. Laporan & Analisa (Pareto Best Seller, Dead Stock)",
      owner: true,
      admin: true,
      gudang: false,
      produksi: false,
      finance: true,
      marketing: true,
    },
    {
      module: "9. Manajemen User & Pengaturan Akun Tim",
      owner: true,
      admin: false,
      gudang: false,
      produksi: false,
      finance: false,
      marketing: false,
    },
  ];

  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserData.name || !newUserData.email) return;

    addUser({
      name: newUserData.name,
      email: newUserData.email,
      phone: newUserData.phone || "0812-0000-0000",
      role: newUserData.role,
      avatar:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      permissions: {
        dashboard:
          newUserData.role === "owner" || newUserData.role === "finance",
        marketplace:
          newUserData.role === "owner" ||
          newUserData.role === "admin" ||
          newUserData.role === "finance",
        products: newUserData.role !== "gudang",
        inventory:
          newUserData.role === "owner" ||
          newUserData.role === "gudang" ||
          newUserData.role === "produksi",
        production:
          newUserData.role === "owner" || newUserData.role === "produksi",
        finance: newUserData.role === "owner" || newUserData.role === "finance",
        suratJalan: true,
        reports: newUserData.role === "owner" || newUserData.role === "finance",
        users: newUserData.role === "owner",
      },
      settings: {
        defaultWarehouse: "Gudang Utama Pusat",
        enableStockAlerts: true,
        enableEscrowAlerts: true,
        enableProductionAlerts: true,
        autoRefreshStock: true,
        minStockBufferPercent: 25,
        notificationSound: true,
        compactTableMode: false,
      },
    });

    setShowAddUserModal(false);
    setNewUserData({ name: "", email: "", phone: "", role: "admin" });
    alert(
      "User staff baru berhasil ditambahkan beserta settingan awal profil!",
    );
  };

  const openSettingsModal = (user: UserAccount) => {
    setSelectedUserForEdit(user);
    if (user.settings) {
      setSettingsForm(user.settings);
    } else {
      setSettingsForm({
        defaultWarehouse: "Gudang Utama Pusat",
        enableStockAlerts: true,
        enableEscrowAlerts: true,
        enableProductionAlerts: true,
        autoRefreshStock: true,
        minStockBufferPercent: 25,
        notificationSound: true,
        compactTableMode: false,
      });
    }
    setShowEditSettingsModal(true);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForEdit) return;
    updateUserSettings(selectedUserForEdit.id, settingsForm);
    setShowEditSettingsModal(false);
    alert(`Settingan akun ${selectedUserForEdit.name} berhasil disimpan!`);
  };

  const openLoginModal = (user: UserAccount) => {
    setLoginTargetUser(user);
    setLoginForm({ email: user.email, password: "" });
    setLoginError("");
    setShowLoginModal(true);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginTargetUser) return;

    const loggedInUser = loginWithEmailPassword(
      loginForm.email,
      loginForm.password,
    );

    if (!loggedInUser) {
      setLoginError(
        "Email atau password salah. Gunakan akun demo berikut: owner@sabhirafashion.id / owner123, finance@sabhirafashion.id / finance123, admin@sabhirafashion.id / admin123, gudang@sabhirafashion.id / gudang123, produksi@sabhirafashion.id / produksi123, marketing@sabhirafashion.id / marketing123",
      );
      return;
    }

    setShowLoginModal(false);
    setLoginTargetUser(null);
    setLoginForm({ email: "", password: "" });
    setLoginError("");
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-indigo-100 text-indigo-800 text-xs font-bold uppercase tracking-wider">
              Keamanan & Personalisasi Tim
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
            Manajemen Akun & Pengaturan Awal Tim
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Konfigurasi profil kerja, preferensi peringatan stok kritis, gudang
            default, dan kontrol hak akses setiap divisi.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowAddUserModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah Akun Staff</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
        <button
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === "users"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Daftar Akun Staff ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("settings")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === "settings"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Data Settingan Awal Setiap Akun</span>
        </button>

        <button
          onClick={() => setActiveTab("permissions")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === "permissions"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Matriks Hak Akses Modul ERP</span>
        </button>
      </div>

      {/* Tab 1: User Account Cards */}
      {activeTab === "users" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((u) => {
            const isCurrent = u.id === currentUser.id;
            return (
              <div
                key={u.id}
                className={`bg-white rounded-2xl p-5 border transition-all shadow-xs flex flex-col justify-between ${
                  isCurrent
                    ? "border-indigo-500 ring-2 ring-indigo-500/10"
                    : "border-slate-200"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={u.avatar}
                        alt={u.name}
                        className="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-100 shadow-2xs"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-slate-900 text-sm">
                            {u.name}
                          </h3>
                          {isCurrent && (
                            <span className="px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[9px] font-bold">
                              Aktif
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500">{u.email}</p>
                        <span
                          className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md mt-1 ${
                            u.role === "owner"
                              ? "bg-amber-100 text-amber-900"
                              : u.role === "admin"
                                ? "bg-blue-100 text-blue-800"
                                : u.role === "gudang"
                                  ? "bg-purple-100 text-purple-800"
                                  : u.role === "produksi"
                                    ? "bg-orange-100 text-orange-800"
                                    : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {u.role.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Settings snapshot */}
                  <div className="mt-4 pt-3 border-t border-slate-100 text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-slate-600 text-[11px]">
                      <span>Gudang Default:</span>
                      <span className="font-semibold text-slate-800">
                        {u.settings?.defaultWarehouse || "Gudang Utama"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600 text-[11px]">
                      <span>Notifikasi Stok Kritis:</span>
                      <span
                        className={`font-semibold ${u.settings?.enableStockAlerts ? "text-emerald-700" : "text-slate-400"}`}
                      >
                        {u.settings?.enableStockAlerts
                          ? "Aktif (On)"
                          : "Nonaktif"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600 text-[11px]">
                      <span>Safety Buffer Stok:</span>
                      <span className="font-semibold text-indigo-700 font-mono">
                        +{u.settings?.minStockBufferPercent || 25}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => openSettingsModal(u)}
                    className="flex-1 py-1.5 px-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center justify-center gap-1"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Ubah Settingan</span>
                  </button>

                  <button
                    onClick={() => {
                      if (isCurrent) return;
                      openLoginModal(u);
                    }}
                    className={`py-1.5 px-3 text-xs font-bold rounded-xl transition-colors ${
                      isCurrent
                        ? "bg-slate-200 text-slate-500 cursor-default"
                        : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                    }`}
                    disabled={isCurrent}
                  >
                    {isCurrent ? "Sedang Dipakai" : "Login Akun"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showLoginModal && loginTargetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-indigo-600">
                  Demo Login
                </p>
                <h2 className="mt-2 text-2xl font-black text-slate-900">
                  Masuk ke Akun {loginTargetUser.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowLoginModal(false);
                  setLoginTargetUser(null);
                  setLoginError("");
                }}
                className="rounded-full bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleLoginSubmit} className="mt-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Email
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={loginForm.email}
                    onChange={(e) =>
                      setLoginForm((prev) => ({ ...prev, email: e.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                    placeholder="contoh: finance@sabhirafashion.id"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    value={loginForm.password}
                    onChange={(e) =>
                      setLoginForm((prev) => ({ ...prev, password: e.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                    placeholder="Masukkan password"
                    required
                  />
                </div>
              </div>

              {loginError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                  {loginError}
                </div>
              )}

              <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-3">
                <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-700">
                  <Sparkles className="h-3.5 w-3.5" />
                  Akun demo cepat
                </div>
                <div className="flex flex-wrap gap-2">
                  {users.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() =>
                        setLoginForm({ email: u.email, password: u.password || "" })
                      }
                      className="rounded-full border border-indigo-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-indigo-700 transition hover:border-indigo-300 hover:bg-indigo-100"
                    >
                      {u.role}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition hover:from-indigo-700 hover:to-violet-700"
              >
                Masuk ke Dashboard
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tab 2: Settings Overview for All Accounts */}
      {activeTab === "settings" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">
              Settingan Awal Konfigurasi Profil Akun Staff
            </h3>
            <p className="text-xs text-slate-500">
              Setiap user akun memiliki preferensi tersendiri untuk lokasi
              gudang prioritas, notifikasi peringatan stok, dan ambang batas
              safety stock.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Nama Akun & Role</th>
                  <th className="py-3 px-3">Gudang Default</th>
                  <th className="py-3 px-3 text-center">Notif Stok Kritis</th>
                  <th className="py-3 px-3 text-center">Notif Escrow</th>
                  <th className="py-3 px-3 text-center">Notif SPK</th>
                  <th className="py-3 px-3 text-center">Buffer Safety</th>
                  <th className="py-3 px-3 text-center">Suara Alarm</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">{u.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono uppercase">
                        {u.role} • {u.email}
                      </p>
                    </td>

                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px]">
                        {u.settings?.defaultWarehouse || "Gudang Utama Pusat"}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center">
                      {u.settings?.enableStockAlerts ? (
                        <span className="text-emerald-700 font-bold">
                          ✓ Aktif
                        </span>
                      ) : (
                        <span className="text-slate-400">✕ Off</span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-center">
                      {u.settings?.enableEscrowAlerts ? (
                        <span className="text-emerald-700 font-bold">
                          ✓ Aktif
                        </span>
                      ) : (
                        <span className="text-slate-400">✕ Off</span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-center">
                      {u.settings?.enableProductionAlerts ? (
                        <span className="text-emerald-700 font-bold">
                          ✓ Aktif
                        </span>
                      ) : (
                        <span className="text-slate-400">✕ Off</span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-center font-mono font-bold text-indigo-700">
                      +{u.settings?.minStockBufferPercent || 25}%
                    </td>

                    <td className="py-3 px-3 text-center">
                      {u.settings?.notificationSound ? "🔔 On" : "🔕 Mute"}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => openSettingsModal(u)}
                        className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                      >
                        Edit Setting
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Permissions Matrix */}
      {activeTab === "permissions" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">
              Matriks Hak Akses Modul ERP (Role-Based Access Control)
            </h3>
            <p className="text-xs text-slate-500">
              Standar keamanan data Sabhira ERP V2 untuk menjaga kerahasiaan
              margin laba dan saldo kas.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Modul & Fitur ERP</th>
                  <th className="py-3 px-3 text-center">👑 Owner</th>
                  <th className="py-3 px-3 text-center">🛍️ Admin Mktp</th>
                  <th className="py-3 px-3 text-center">📦 Tim Gudang</th>
                  <th className="py-3 px-3 text-center">✂️ Tim Produksi</th>
                  <th className="py-3 px-3 text-center">💰 Tim Finance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {permissionsMatrix.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {item.module}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {item.owner ? (
                        <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                      ) : (
                        <X className="w-4 h-4 text-slate-300 mx-auto" />
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {item.admin ? (
                        <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                      ) : (
                        <X className="w-4 h-4 text-slate-300 mx-auto" />
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {item.gudang ? (
                        <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                      ) : (
                        <X className="w-4 h-4 text-slate-300 mx-auto" />
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {item.produksi ? (
                        <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                      ) : (
                        <X className="w-4 h-4 text-slate-300 mx-auto" />
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {item.finance ? (
                        <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                      ) : (
                        <X className="w-4 h-4 text-slate-300 mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Edit Settings Akun */}
      {showEditSettingsModal && selectedUserForEdit && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Pengaturan Akun ({selectedUserForEdit.name})
              </h3>
              <button
                onClick={() => setShowEditSettingsModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleSaveSettings}
              className="mt-4 space-y-3.5 text-xs"
            >
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Lokasi Gudang Prioritas
                </label>
                <select
                  value={settingsForm.defaultWarehouse}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      defaultWarehouse: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-medium"
                >
                  <option value="Gudang Utama Pusat">Gudang Utama Pusat</option>
                  <option value="Alokasi Stok Live Shopee & TikTok">
                    Alokasi Stok Live Shopee & TikTok
                  </option>
                  <option value="Gudang Butik Offline">
                    Gudang Butik Offline
                  </option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Safety Stock Buffer Tambahan (%)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={settingsForm.minStockBufferPercent}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        minStockBufferPercent: Number(e.target.value),
                      })
                    }
                    className="w-24 px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-xl"
                  />
                  <span className="text-slate-500 text-[11px]">
                    Buffer pengingat sebelum stok benar-benar menyentuh batas
                    kritis.
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <p className="font-bold text-slate-800 text-xs">
                  Preferensi Peringatan & Notifikasi:
                </p>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settingsForm.enableStockAlerts}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        enableStockAlerts: e.target.checked,
                      })
                    }
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-slate-700 font-medium">
                    Peringatan Otomatis Stok Kritis / Habis
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settingsForm.enableEscrowAlerts}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        enableEscrowAlerts: e.target.checked,
                      })
                    }
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-slate-700 font-medium">
                    Peringatan Pencairan Dana Marketplace (Escrow)
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settingsForm.enableProductionAlerts}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        enableProductionAlerts: e.target.checked,
                      })
                    }
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-slate-700 font-medium">
                    Peringatan Deadline SPK & Pengurangan Bahan
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settingsForm.notificationSound}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        notificationSound: e.target.checked,
                      })
                    }
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-slate-700 font-medium">
                    Suara Efek Alarm Peringatan (Sound Alert)
                  </span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditSettingsModal(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm"
                >
                  Simpan Settingan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Tambah User Baru */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Tambah Akun Staff Baru
              </h3>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleAddUserSubmit}
              className="mt-4 space-y-3 text-xs"
            >
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Lengkap Staff
                </label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Ahmad Zaki (Staff QC)"
                  value={newUserData.name}
                  onChange={(e) =>
                    setNewUserData({ ...newUserData, name: e.target.value })
                  }
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Email Perusahaan
                </label>
                <input
                  type="email"
                  required
                  placeholder="zaki@sabhiragroup.com"
                  value={newUserData.email}
                  onChange={(e) =>
                    setNewUserData({ ...newUserData, email: e.target.value })
                  }
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  No Telepon / WA
                </label>
                <input
                  type="text"
                  placeholder="0812-3456-7890"
                  value={newUserData.phone}
                  onChange={(e) =>
                    setNewUserData({ ...newUserData, phone: e.target.value })
                  }
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Role / Jabatan & Hak Akses
                </label>
                <select
                  value={newUserData.role}
                  onChange={(e) =>
                    setNewUserData({
                      ...newUserData,
                      role: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-medium"
                >
                  <option value="admin">
                    Admin Marketplace (Shopee, TikTok, Resi)
                  </option>
                  <option value="gudang">
                    Tim Gudang (Barang Masuk/Keluar, Opname)
                  </option>
                  <option value="produksi">
                    Tim Produksi (SPK, Bahan Baku, QC)
                  </option>
                  <option value="finance">
                    Tim Keuangan (Buku Kas, Laba Rugi, Payout)
                  </option>
                  <option value="owner">Owner (Full Access All Modules)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm"
                >
                  Buat Akun Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
