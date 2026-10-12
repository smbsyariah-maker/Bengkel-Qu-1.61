import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Palette, 
  Database, 
  UploadCloud, 
  RotateCcw, 
  Check, 
  Download, 
  AlertTriangle, 
  FileCheck, 
  Sparkles,
  ShieldAlert,
  Crown,
  Building2,
  Store,
  Calendar,
  CheckCircle2,
  Layers,
  ChevronRight,
  ShieldCheck,
  Plus,
  Minus
} from 'lucide-react';
import { 
  ServiceQueue, 
  Sparepart, 
  Transaction, 
  CustomerVehicle, 
  WorkshopProfile, 
  RolePermissionConfig, 
  BranchItem,
  UserSession,
  LicensePlan,
  LICENSE_PLAN_ENUM,
  LicenseBillingPeriod
} from '../../types';
import { LicenseController } from '../../controllers/LicenseController';

interface SettingViewProps {
  initialTab?: string;
  onBack: () => void;
  queues: ServiceQueue[];
  spareparts: Sparepart[];
  transactions: Transaction[];
  customers: CustomerVehicle[];
  profile: WorkshopProfile;
  permissions: RolePermissionConfig[];
  branches: BranchItem[];
  onRestoreData: (backupData: any) => void;
  onResetData: (mode: 'daily' | 'factory') => void;
  userSession?: UserSession | null;
  onLogout?: () => void;
  currentLicensePlan?: LicensePlan;
  onUpdateLicensePlan?: (plan: LicensePlan) => void;
}

export const SettingView: React.FC<SettingViewProps> = ({
  initialTab = 'setting-lisensi',
  onBack,
  queues,
  spareparts,
  transactions,
  customers,
  profile,
  permissions,
  branches,
  onRestoreData,
  onResetData,
  userSession,
  onLogout,
  currentLicensePlan,
  onUpdateLicensePlan
}) => {
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  // 0. License Plan State (Tahap 1/3: Refactor UI Settings & Enum Lisensi)
  // Replaces legacy Enterprise with AddOnBranch safely via LicenseController
  const [currentPlan, setCurrentPlan] = useState<LicensePlan>(() => {
    return currentLicensePlan || LicenseController.getCurrentPlan();
  });

  // Core / Pro: UI Opsi Pilihan (1 Bulan, 3 Bulan, 6 Bulan, 12 Bulan)
  const [coreDuration, setCoreDuration] = useState<LicenseBillingPeriod>(() => {
    return LicenseController.getCoreDuration();
  });

  // Add-On (+1 Cabang): Counter modul opsional penambahan cabang
  const [addonBranchCount, setAddonBranchCount] = useState<number>(() => {
    return LicenseController.getAddonBranchCount();
  });

  const [licenseNotification, setLicenseNotification] = useState<string | null>(null);

  // 1. Theme State
  const [selectedTheme, setSelectedTheme] = useState<'emerald' | 'teal' | 'forest' | 'lime'>(() => {
    return (localStorage.getItem('bq_theme') as any) || 'emerald';
  });
  const [themeSaved, setThemeSaved] = useState(false);

  // 2. Backup Options State
  const [backupOptions, setBackupOptions] = useState({
    queues: true,
    spareparts: true,
    transactions: true,
    customers: true,
    profile: true,
    permissions: true,
    branches: true
  });
  const [backupDownloaded, setBackupDownloaded] = useState(false);

  // 3. Restore State
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [restorePreview, setRestorePreview] = useState<any | null>(null);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [restoreSuccess, setRestoreSuccess] = useState(false);

  // 4. Reset State
  const [resetConfirmationText, setResetConfirmationText] = useState('');
  const [resetModalMode, setResetModalMode] = useState<'daily' | 'factory' | null>(null);
  const [resetSuccessNotice, setResetSuccessNotice] = useState<string | null>(null);

  // Core Duration Option Packages (Rp1.000 / Hari)
  const CORE_DURATION_OPTIONS: {
    id: LicenseBillingPeriod;
    label: string;
    days: number;
    price: number;
    formattedPrice: string;
    badge?: string;
    badgeColor?: string;
  }[] = [
    {
      id: '1_bulan',
      label: '1 Bulan',
      days: 30,
      price: 30000,
      formattedPrice: 'Rp30.000'
    },
    {
      id: '3_bulan',
      label: '3 Bulan',
      days: 90,
      price: 90000,
      formattedPrice: 'Rp90.000',
      badge: 'Hemat',
      badgeColor: 'bg-emerald-100 text-emerald-800'
    },
    {
      id: '6_bulan',
      label: '6 Bulan',
      days: 180,
      price: 180000,
      formattedPrice: 'Rp180.000',
      badge: 'Populer',
      badgeColor: 'bg-blue-100 text-blue-800'
    },
    {
      id: '12_bulan',
      label: '12 Bulan',
      days: 365,
      price: 360000,
      formattedPrice: 'Rp360.000',
      badge: 'Terhemat 1 Tahun',
      badgeColor: 'bg-amber-100 text-amber-800'
    }
  ];

  const handleSelectPlan = (plan: LicensePlan) => {
    setCurrentPlan(plan);
    LicenseController.setCurrentPlan(plan);
    if (onUpdateLicensePlan) {
      onUpdateLicensePlan(plan);
    }
    const planInfo = LicenseController.getPlanInfo(plan);
    setLicenseNotification(`Paket ${planInfo.name} aktif dan tersimpan!`);
    setTimeout(() => setLicenseNotification(null), 3000);
  };

  const handleSelectCoreDuration = (period: LicenseBillingPeriod) => {
    setCoreDuration(period);
    LicenseController.setCoreDuration(period);
    const durOpt = LicenseController.getDurationOption(period);
    if (durOpt) {
      setLicenseNotification(`Durasi Core terpilih: ${durOpt.label} (${durOpt.formattedPrice})`);
      setTimeout(() => setLicenseNotification(null), 2500);
    }
  };

  const handleUpdateAddonBranch = (delta: number) => {
    const updated = Math.max(1, addonBranchCount + delta);
    setAddonBranchCount(updated);
    LicenseController.setAddonBranchCount(updated);
  };

  // Theme Choices
  const THEMES = [
    {
      id: 'emerald',
      name: 'Hijau Emerald (Standar Bengkel Qu)',
      desc: 'Warna resmi hijau bersih yang sejuk dan profesional',
      color: '#008952',
      badge: 'Aktif'
    },
    {
      id: 'teal',
      name: 'Teal Mint Modern',
      desc: 'Nuansa biru-kehijauan cerah ala aplikasi fintech modern',
      color: '#0d9488',
      badge: 'Pilihan'
    },
    {
      id: 'forest',
      name: 'Hijau Forest Solid',
      desc: 'Warna hijau daun pekat dengan kontras tinggi',
      color: '#15803d',
      badge: 'Pilihan'
    },
    {
      id: 'lime',
      name: 'Lime Racing Otomotif',
      desc: 'Warna hijau sporty terinspirasi arena balap motor',
      color: '#65a30d',
      badge: 'Sporty'
    }
  ];

  const handleApplyTheme = (themeId: any) => {
    setSelectedTheme(themeId);
    localStorage.setItem('bq_theme', themeId);
    setThemeSaved(true);
    setTimeout(() => setThemeSaved(false), 2000);
  };

  const handleDownloadBackup = () => {
    const backupPayload: any = {
      app: 'Bengkel Qu 1.61',
      timestamp: new Date().toISOString(),
      version: '1.61.0',
      data: {}
    };

    if (backupOptions.queues) backupPayload.data.queues = queues;
    if (backupOptions.spareparts) backupPayload.data.spareparts = spareparts;
    if (backupOptions.transactions) backupPayload.data.transactions = transactions;
    if (backupOptions.customers) backupPayload.data.customers = customers;
    if (backupOptions.profile) backupPayload.data.profile = profile;
    if (backupOptions.permissions) backupPayload.data.permissions = permissions;
    if (backupOptions.branches) backupPayload.data.branches = branches;

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupPayload, null, 2));
    const downloadAnchor = document.createElement('a');
    const dateFormatted = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `bengkelqu_backup_${dateFormatted}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setBackupDownloaded(true);
    setTimeout(() => setBackupDownloaded(false), 2500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRestoreFile(file);
    setRestoreError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed.data && !parsed.queues) {
          throw new Error('Format file tidak sesuai dengan skema Bengkel Qu');
        }
        setRestorePreview(parsed.data || parsed);
      } catch (err: any) {
        setRestoreError(err.message || 'Gagal membaca berkas JSON');
        setRestorePreview(null);
      }
    };
    reader.readAsText(file);
  };

  const handleExecuteRestore = () => {
    if (!restorePreview) return;
    onRestoreData(restorePreview);
    setRestoreSuccess(true);
    setTimeout(() => {
      setRestoreSuccess(false);
      setRestoreFile(null);
      setRestorePreview(null);
    }, 2500);
  };

  const handleExecuteReset = () => {
    if (resetConfirmationText.toUpperCase() !== 'RESET') return;
    if (resetModalMode) {
      onResetData(resetModalMode);
      setResetSuccessNotice(
        resetModalMode === 'daily'
          ? 'Antrian & Transaksi harian berhasil dibersihkan!'
          : 'Semua data telah direset ke setelan awal pabrik.'
      );
      setResetModalMode(null);
      setResetConfirmationText('');
      setTimeout(() => setResetSuccessNotice(null), 3000);
    }
  };

  return (
    <div className="flex-1 bg-slate-50 flex flex-col">
      {/* Top Header */}
      <div className="bg-[#008952] text-white px-5 pt-4 pb-6 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              aria-label="Kembali"
              className="w-10 h-10 rounded-full bg-white/15 active:bg-white/30 flex items-center justify-center transition-colors shadow-sm cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Setting Bengkel Qu</h1>
              <p className="text-xs text-emerald-100 font-medium">Lisensi, Tema, Backup & Pemulihan</p>
            </div>
          </div>
        </div>

        {/* Tab Switcher Horizontal */}
        <div className="flex items-center gap-1.5 mt-4 bg-emerald-800/50 p-1 rounded-xl text-xs overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('setting-lisensi')}
            className={`flex-1 min-w-[95px] py-1.5 px-2 rounded-lg font-bold transition-all text-center cursor-pointer ${
              activeTab === 'setting-lisensi' ? 'bg-white text-[#008952] shadow-xs' : 'text-emerald-100 hover:text-white'
            }`}
          >
            Lisensi & Paket
          </button>
          <button
            onClick={() => setActiveTab('setting-tema')}
            className={`flex-1 min-w-[65px] py-1.5 px-2 rounded-lg font-bold transition-all text-center cursor-pointer ${
              activeTab === 'setting-tema' ? 'bg-white text-[#008952] shadow-xs' : 'text-emerald-100 hover:text-white'
            }`}
          >
            Tema
          </button>
          <button
            onClick={() => setActiveTab('setting-backup')}
            className={`flex-1 min-w-[85px] py-1.5 px-2 rounded-lg font-bold transition-all text-center cursor-pointer ${
              activeTab === 'setting-backup' ? 'bg-white text-[#008952] shadow-xs' : 'text-emerald-100 hover:text-white'
            }`}
          >
            Backup - Opsi
          </button>
          <button
            onClick={() => setActiveTab('setting-restore')}
            className={`flex-1 min-w-[70px] py-1.5 px-2 rounded-lg font-bold transition-all text-center cursor-pointer ${
              activeTab === 'setting-restore' ? 'bg-white text-[#008952] shadow-xs' : 'text-emerald-100 hover:text-white'
            }`}
          >
            Restore
          </button>
          <button
            onClick={() => setActiveTab('setting-reset')}
            className={`flex-1 min-w-[65px] py-1.5 px-2 rounded-lg font-bold transition-all text-center cursor-pointer ${
              activeTab === 'setting-reset' ? 'bg-white text-rose-600 shadow-xs' : 'text-emerald-100 hover:text-white'
            }`}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {/* ================= TAB 0: LISENSI & PAKET (TAHAP 1/3) ================= */}
        {activeTab === 'setting-lisensi' && (
          <div className="space-y-3.5 animate-in fade-in">
            {/* Header info */}
            <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-100">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-amber-500 fill-amber-500/20" />
                  <h3 className="font-bold text-slate-900 text-sm">Paket Lisensi Usaha Qu</h3>
                </div>
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#008952] border border-emerald-200">
                  Status: {currentPlan === 'Basic' ? 'Basic (Freemium)' : currentPlan === 'Core' ? 'Core / Pro Aktif' : 'Add-On Aktif'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Pilih skema paket yang sesuai dengan kebutuhan operasional bengkel Anda.
              </p>
            </div>

            {/* Notification alert */}
            {licenseNotification && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 text-[#008952] rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <Check className="w-4 h-4 shrink-0 stroke-[2.5]" />
                <span>{licenseNotification}</span>
              </div>
            )}

            {/* Current Active Plan Banner */}
            <div className="bg-linear-to-r from-emerald-800 to-[#008952] rounded-2xl p-4 text-white shadow-md relative overflow-hidden">
              <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-2 translate-y-2">
                <Crown className="w-28 h-28 text-white" />
              </div>
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-200 block">
                    Paket Terpasang Saat Ini
                  </span>
                  <h4 className="text-base font-extrabold text-white mt-0.5">
                    {currentPlan === 'Basic' && 'Basic (Freemium)'}
                    {currentPlan === 'Core' && 'Core / Pro — Rp1.000 / Hari'}
                    {currentPlan === 'AddOnBranch' && `Add-On (+${addonBranchCount} Cabang)`}
                  </h4>
                  <p className="text-[11px] text-emerald-100/90 mt-0.5">
                    {currentPlan === 'Basic' && 'Kasir dasar & manajemen antrian standar tanpa langganan.'}
                    {currentPlan === 'Core' && `Pilihan durasi: ${CORE_DURATION_OPTIONS.find((o) => o.id === coreDuration)?.label || '1 Bulan'} (${CORE_DURATION_OPTIONS.find((o) => o.id === coreDuration)?.formattedPrice || 'Rp30.000'}).`}
                    {currentPlan === 'AddOnBranch' && `Modul ekspansi untuk ${addonBranchCount} cabang tambahan.`}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-white stroke-[2.4]" />
                </div>
              </div>
            </div>

            {/* DAFTAR 3 PAKET: Basic (Freemium), Core / Pro, Add-On (+1 Cabang) */}
            <div className="space-y-3">
              {/* ---------------- PAKET 1: Basic (Freemium) ---------------- */}
              <div 
                className={`bg-white rounded-2xl p-4.5 border transition-all ${
                  currentPlan === 'Basic' 
                    ? 'border-[#008952] ring-2 ring-emerald-500/20 shadow-md' 
                    : 'border-slate-200/90 hover:border-emerald-300 shadow-2xs'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                      <Store className="w-6 h-6 stroke-[2.2]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-slate-900 text-sm">Basic (Freemium)</h4>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          Gratis
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 font-medium">Gratis / Kasir Dasar</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black text-slate-800">Rp 0</span>
                    <span className="text-[10px] text-slate-400 block font-medium">Selamanya</span>
                  </div>
                </div>

                <div className="mt-3.5 pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[2.5]" />
                    <span>Kasir POS Dasar & Cetak Struk Nota Transaksi</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[2.5]" />
                    <span>Pendaftaran & Antrian Servis Kendaraan</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[2.5]" />
                    <span>Katalog Suku Cadang Dasar (1 Bengkel)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[2.5]" />
                    <span>Tanpa Biaya Berlangganan Bulanan</span>
                  </div>
                </div>

                <div className="mt-4 pt-2">
                  <button
                    type="button"
                    onClick={() => handleSelectPlan('Basic')}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      currentPlan === 'Basic'
                        ? 'bg-slate-100 text-slate-700 border border-slate-300'
                        : 'bg-slate-800 hover:bg-slate-900 text-white shadow-xs'
                    }`}
                  >
                    {currentPlan === 'Basic' ? (
                      <>
                        <Check className="w-4 h-4 stroke-[2.5]" />
                        <span>Paket Basic Sedang Digunakan</span>
                      </>
                    ) : (
                      <span>Pilih Paket Basic (Freemium)</span>
                    )}
                  </button>
                </div>
              </div>

              {/* ---------------- PAKET 2: Core / Pro (Rp1.000 / Hari) ---------------- */}
              <div 
                className={`bg-white rounded-2xl p-4.5 border transition-all relative overflow-hidden ${
                  currentPlan === 'Core' 
                    ? 'border-[#008952] ring-2 ring-emerald-500/25 shadow-lg bg-emerald-50/15' 
                    : 'border-emerald-300 hover:border-emerald-500 shadow-2xs'
                }`}
              >
                {/* Popular ribbon */}
                <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[9px] font-black uppercase tracking-wider py-1 px-3 rounded-bl-xl shadow-xs flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>Rekomendasi Utama</span>
                </div>

                <div className="flex items-start justify-between pt-1">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-[#008952] flex items-center justify-center shrink-0 shadow-xs">
                      <ShieldAlert className="w-6 h-6 stroke-[2.2]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-slate-900 text-sm">Core / Pro</h4>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-[#008952]">
                          Pro
                        </span>
                      </div>
                      <p className="text-xs text-[#008952] mt-0.5 font-bold">Rp1.000 / Hari</p>
                    </div>
                  </div>
                  <div className="text-right pr-2">
                    <span className="text-base font-black text-[#008952]">Rp1.000</span>
                    <span className="text-[10px] text-slate-500 block font-medium">/ Hari Operasional</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
                  Solusi manajemen bengkel lengkap dengan matriks izin SPV/Kasir, laporan keuangan laba rugi, dan CRM WhatsApp.
                </p>

                {/* UI OPSI PILIHAN PERIODE (1 Bulan, 3 Bulan, 6 Bulan, 12 Bulan) */}
                <div className="mt-3.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#008952]" />
                      <span className="text-[11px] font-bold text-slate-800">
                        Pilihan Periode Berlangganan:
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-semibold">
                      Tarif Tetap: Rp1.000/hari
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {CORE_DURATION_OPTIONS.map((opt) => {
                      const isSelected = coreDuration === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleSelectCoreDuration(opt.id)}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer relative ${
                            isSelected
                              ? 'bg-white border-[#008952] ring-2 ring-emerald-500/20 shadow-xs'
                              : 'bg-white/80 border-slate-200 hover:border-emerald-200'
                          }`}
                        >
                          {opt.badge && (
                            <span className={`absolute -top-1.5 -right-1 text-[8.5px] font-black px-1.5 py-0.2 rounded-md shadow-2xs ${opt.badgeColor}`}>
                              {opt.badge}
                            </span>
                          )}
                          <div className="flex items-center justify-between">
                            <span className={`text-xs font-bold ${isSelected ? 'text-[#008952]' : 'text-slate-800'}`}>
                              {opt.label}
                            </span>
                            {isSelected && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#008952] shrink-0" />
                            )}
                          </div>
                          <div className="text-[11px] font-black text-slate-900 mt-0.5">
                            {opt.formattedPrice}
                          </div>
                          <span className="text-[9.5px] text-slate-400 block mt-0.2">
                            ({opt.days} Hari)
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Fitur Core */}
                <div className="mt-3 pt-2 text-xs text-slate-600 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[2.5]" />
                    <span>Semua fitur paket Basic (Freemium) disertakan</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[2.5]" />
                    <span>Hak Akses SPV & Kasir (Matriks Otorisasi Role)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[2.5]" />
                    <span>Laporan Laba Rugi, Piutang & Tutup Kasir Harian</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[2.5]" />
                    <span>Marketing WhatsApp Broadcast & Kupon Diskon Voucher</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[2.5]" />
                    <span>Pencadangan (Backup) & Pemulihan (Restore) JSON</span>
                  </div>
                </div>

                <div className="mt-4 pt-2">
                  <button
                    type="button"
                    onClick={() => handleSelectPlan('Core')}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 bg-[#008952] hover:bg-emerald-700 active:scale-98 text-white shadow-md shadow-emerald-700/20"
                  >
                    {currentPlan === 'Core' ? (
                      <>
                        <Check className="w-4 h-4 stroke-[2.5]" />
                        <span>Paket Core / Pro Aktif ({CORE_DURATION_OPTIONS.find((o) => o.id === coreDuration)?.label})</span>
                      </>
                    ) : (
                      <>
                        <Crown className="w-4 h-4" />
                        <span>Pilih Paket Core / Pro ({CORE_DURATION_OPTIONS.find((o) => o.id === coreDuration)?.label})</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* ---------------- PAKET 3: Add-On (+1 Cabang) ---------------- */}
              {/* Menggantikan posisi tampilan Enterprise sebagai modul opsional penambahan cabang */}
              <div 
                className={`bg-white rounded-2xl p-4.5 border transition-all ${
                  currentPlan === 'AddOnBranch' 
                    ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-md bg-blue-50/10' 
                    : 'border-slate-200/90 hover:border-blue-300 shadow-2xs'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                      <Building2 className="w-6 h-6 stroke-[2.2]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-slate-900 text-sm">Add-On (+1 Cabang)</h4>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                          Modul Opsional
                        </span>
                      </div>
                      <p className="text-xs text-blue-700 mt-0.5 font-medium">
                        Pengganti Skema Enterprise untuk Multi-Cabang
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black text-blue-800">+{addonBranchCount}</span>
                    <span className="text-[10px] text-slate-400 block font-medium">Cabang Baru</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
                  Modul opsional untuk memperluas operasional dari 1 bengkel menjadi multi-cabang/outlet terpusat secara fleksibel.
                </p>

                {/* Counter Selector Cabang Tambahan */}
                <div className="mt-3.5 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Jumlah Cabang Tambahan:
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      Bisa disesuaikan sewaktu-waktu
                    </span>
                  </div>

                  <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-xl border border-slate-200 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => handleUpdateAddonBranch(-1)}
                      disabled={addonBranchCount <= 1}
                      className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-black text-slate-900">
                      +{addonBranchCount}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleUpdateAddonBranch(1)}
                      className="w-7 h-7 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-800 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Fitur Add-On Cabang */}
                <div className="mt-3.5 pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 stroke-[2.5]" />
                    <span>Formulir dan database terintegrasi multi kantor cabang</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 stroke-[2.5]" />
                    <span>Monitoring antrian & transaksi per kantor cabang terpisah</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 stroke-[2.5]" />
                    <span>Penugasan SPV khusus untuk masing-masing outlet</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 stroke-[2.5]" />
                    <span>Bebas ekspansi tanpa migrasi sistem rumit</span>
                  </div>
                </div>

                <div className="mt-4 pt-2">
                  <button
                    type="button"
                    onClick={() => handleSelectPlan('AddOnBranch')}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      currentPlan === 'AddOnBranch'
                        ? 'bg-blue-50 text-blue-800 border border-blue-300'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                    }`}
                  >
                    {currentPlan === 'AddOnBranch' ? (
                      <>
                        <Check className="w-4 h-4 stroke-[2.5]" />
                        <span>Add-On Cabang Aktif (+{addonBranchCount} Cabang)</span>
                      </>
                    ) : (
                      <>
                        <Building2 className="w-4 h-4" />
                        <span>Aktifkan Add-On (+{addonBranchCount} Cabang)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 1: TEMA ================= */}
        {activeTab === 'setting-tema' && (
          <div className="space-y-3 animate-in fade-in">
            <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-100">
              <div className="flex items-center gap-2 mb-1">
                <Palette className="w-4 h-4 text-[#008952]" />
                <h3 className="font-bold text-slate-900 text-sm">Pilihan Tema Warna</h3>
              </div>
              <p className="text-xs text-slate-500">
                Pilih palet nuansa warna antarmuka untuk seluruh dashboard dan tombol Bengkel Qu.
              </p>
            </div>

            {themeSaved && (
              <div className="p-3 bg-emerald-100 border border-emerald-300 text-[#008952] rounded-2xl text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>Tema berhasil diterapkan dan disimpan!</span>
              </div>
            )}

            <div className="space-y-2.5">
              {THEMES.map((t) => (
                <div
                  key={t.id}
                  onClick={() => handleApplyTheme(t.id)}
                  className={`bg-white rounded-2xl p-4 shadow-xs border transition-all cursor-pointer flex items-center justify-between ${
                    selectedTheme === t.id
                      ? 'border-[#008952] ring-2 ring-emerald-500/20 shadow-md'
                      : 'border-slate-100 hover:border-emerald-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-2xl shadow-sm flex items-center justify-center text-white font-black"
                      style={{ backgroundColor: t.color }}
                    >
                      ✓
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">{t.name}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">{t.desc}</p>
                    </div>
                  </div>

                  <div className="shrink-0 pl-2">
                    {selectedTheme === t.id ? (
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-[#008952] border border-emerald-200">
                        Dipakai
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-medium">Pilih</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 2: BACKUP - OPSI ================= */}
        {activeTab === 'setting-backup' && (
          <div className="space-y-3 animate-in fade-in">
            <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-100">
              <div className="flex items-center gap-2 mb-1">
                <Database className="w-4 h-4 text-[#008952]" />
                <h3 className="font-bold text-slate-900 text-sm">Opsi Pencadangan Data (Backup)</h3>
              </div>
              <p className="text-xs text-slate-500">
                Pilih modul data yang ingin disertakan ke dalam berkas cadangan (.JSON).
              </p>
            </div>

            {backupDownloaded && (
              <div className="p-3 bg-emerald-100 border border-emerald-300 text-[#008952] rounded-2xl text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>Berkas backup berhasil dibuat dan diunduh ke perangkat Anda!</span>
              </div>
            )}

            {/* Checkbox Options Card */}
            <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-100 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
                <span className="font-bold text-slate-800">Daftar Modul untuk Dicadangkan:</span>
                <button
                  type="button"
                  onClick={() =>
                    setBackupOptions({
                      queues: true,
                      spareparts: true,
                      transactions: true,
                      customers: true,
                      profile: true,
                      permissions: true,
                      branches: true
                    })
                  }
                  className="text-[11px] font-semibold text-[#008952] hover:underline cursor-pointer"
                >
                  Pilih Semua
                </button>
              </div>

              {[
                { key: 'queues', label: 'Antrian Servis & Pengerjaan', count: `${queues.length} Unit` },
                { key: 'spareparts', label: 'Inventaris & Stok Sparepart', count: `${spareparts.length} Item` },
                { key: 'transactions', label: 'Riwayat Transaksi & Nota Kasir', count: `${transactions.length} Faktur` },
                { key: 'customers', label: 'Database Pelanggan & Kendaraan', count: `${customers.length} Orang` },
                { key: 'profile', label: 'Profil Resmi Bengkel & Pemilik', count: '1 Profil' },
                { key: 'permissions', label: 'Hak Akses Otoritas SPV & Kasir', count: `${permissions.length} Izin` },
                { key: 'branches', label: 'Manajemen Multi Cabang', count: `${branches.length} Cabang` }
              ].map((opt) => (
                <label
                  key={opt.key}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={(backupOptions as any)[opt.key]}
                      onChange={(e) =>
                        setBackupOptions({
                          ...backupOptions,
                          [opt.key]: e.target.checked
                        })
                      }
                      className="w-4 h-4 text-[#008952] rounded border-slate-300 focus:ring-emerald-500"
                    />
                    <span className="font-semibold text-slate-800">{opt.label}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 font-bold text-slate-500">
                    {opt.count}
                  </span>
                </label>
              ))}

              <div className="pt-2">
                <button
                  onClick={handleDownloadBackup}
                  className="w-full bg-[#008952] hover:bg-emerald-700 active:scale-98 text-white font-bold py-3.5 rounded-2xl shadow-md shadow-emerald-700/20 text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4 stroke-[2.3]" />
                  <span>Unduh File Cadangan (.JSON)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: RESTORE ================= */}
        {activeTab === 'setting-restore' && (
          <div className="space-y-3 animate-in fade-in">
            <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-100">
              <div className="flex items-center gap-2 mb-1">
                <UploadCloud className="w-4 h-4 text-[#008952]" />
                <h3 className="font-bold text-slate-900 text-sm">Pemulihan Data (Restore)</h3>
              </div>
              <p className="text-xs text-slate-500">
                Pilih atau unggah berkas backup JSON Bengkel Qu untuk memulihkan data.
              </p>
            </div>

            {restoreSuccess && (
              <div className="p-3 bg-emerald-100 border border-emerald-300 text-[#008952] rounded-2xl text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>Seluruh data berhasil dipulihkan dari berkas cadangan!</span>
              </div>
            )}

            {restoreError && (
              <div className="p-3 bg-rose-100 border border-rose-300 text-rose-700 rounded-2xl text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span>{restoreError}</span>
              </div>
            )}

            <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-100 space-y-4">
              {/* File Input Box */}
              <div className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 rounded-2xl p-6 text-center bg-emerald-50/30 transition-all cursor-pointer relative">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <UploadCloud className="w-10 h-10 text-[#008952] mx-auto mb-2" />
                <h4 className="font-bold text-slate-800 text-xs">
                  {restoreFile ? restoreFile.name : 'Pilih Berkas Backup (.JSON)'}
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Klik di sini untuk menelusuri berkas dari perangkat
                </p>
              </div>

              {/* Preview of file content */}
              {restorePreview && (
                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 text-xs space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                    <FileCheck className="w-4 h-4 text-[#008952]" />
                    <span>Isi Data Cadangan Terdeteksi:</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-600">
                    <div>• Antrian: {restorePreview.queues?.length || 0} unit</div>
                    <div>• Sparepart: {restorePreview.spareparts?.length || 0} item</div>
                    <div>• Transaksi: {restorePreview.transactions?.length || 0} nota</div>
                    <div>• Pelanggan: {restorePreview.customers?.length || 0} data</div>
                    <div>• Cabang: {restorePreview.branches?.length || 0} outlet</div>
                    <div>• Hak Akses: {restorePreview.permissions?.length || 0} izin</div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={handleExecuteRestore}
                      className="w-full bg-[#008952] hover:bg-emerald-700 active:scale-98 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-700/20 cursor-pointer"
                    >
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span>Terapkan Pemulihan Database Sekarang</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 4: RESET ================= */}
        {activeTab === 'setting-reset' && (
          <div className="space-y-3 animate-in fade-in">
            <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-100">
              <div className="flex items-center gap-2 mb-1">
                <RotateCcw className="w-4 h-4 text-rose-600" />
                <h3 className="font-bold text-slate-900 text-sm">Reset & Pembersihan Data</h3>
              </div>
              <p className="text-xs text-slate-500">
                Opsi pembersihan data operasional harian atau pengembalian menyeluruh ke setelan demo awal pabrik.
              </p>
            </div>

            {resetSuccessNotice && (
              <div className="p-3 bg-emerald-100 border border-emerald-300 text-[#008952] rounded-2xl text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>{resetSuccessNotice}</span>
              </div>
            )}

            {/* Opsi 1: Reset Harian */}
            <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-100 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Bersihkan Shift & Transaksi Hari Ini</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Menghapus antrian yang selesai dan riwayat transaksi shift hari ini tanpa menghapus stok barang.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setResetModalMode('daily')}
                className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-bold px-3 py-2 rounded-xl text-xs active:scale-95 transition-all cursor-pointer mt-1"
              >
                Bersihkan Shift Hari Ini
              </button>
            </div>

            {/* Opsi 2: Reset Total Pabrik */}
            <div className="bg-white rounded-2xl p-4 shadow-xs border border-rose-200 space-y-2 bg-rose-50/20">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-rose-700 font-bold text-xs">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Reset Total ke Setelan Pabrik</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Mengembalikan seluruh antrian, sparepart, cabang, dan profil ke data awal standar pabrik.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setResetModalMode('factory')}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-2 rounded-xl text-xs active:scale-95 shadow-xs transition-all cursor-pointer mt-1"
              >
                Reset Total ke Setelan Pabrik
              </button>
            </div>

            {/* Opsi 3: Akun Google & Logout */}
            {userSession && (
              <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-100 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span className="font-bold text-xs text-slate-800">Akun Google Terhubung</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {userSession.role}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block">{userSession.name}</span>
                    <span className="text-[11px] text-slate-500 font-mono">{userSession.email}</span>
                  </div>

                  {onLogout && (
                    <button
                      type="button"
                      onClick={onLogout}
                      className="bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-700 font-bold px-3 py-1.5 rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      Keluar / Logout
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Modal for Reset */}
      {resetModalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-100 p-5 space-y-3.5">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="font-extrabold text-slate-900 text-sm">
                Konfirmasi Reset {resetModalMode === 'daily' ? 'Harian' : 'Pabrik'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Tindakan ini tidak dapat dibatalkan. Ketik kata <span className="font-black text-rose-600">RESET</span> di bawah untuk melanjutkan.
              </p>
            </div>

            <input
              type="text"
              value={resetConfirmationText}
              onChange={(e) => setResetConfirmationText(e.target.value)}
              placeholder="Ketik RESET"
              className="w-full text-center bg-slate-50 border border-slate-300 rounded-xl py-2 font-mono text-sm uppercase font-bold tracking-widest text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
            />

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setResetModalMode(null);
                  setResetConfirmationText('');
                }}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={resetConfirmationText.toUpperCase() !== 'RESET'}
                onClick={handleExecuteReset}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                Ya, Reset Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
