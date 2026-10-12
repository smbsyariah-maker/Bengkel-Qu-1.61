/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  LicensePlan, 
  LICENSE_PLAN_ENUM, 
  LicenseBillingPeriod, 
  LicensePlanInfo, 
  CoreDurationOption 
} from '../types';

/**
 * Controller & Local Database Handler untuk Manajemen Lisensi Usaha Qu / Bengkel Qu.
 * Menangani skema paket baru: Basic (Freemium), Core / Pro (Rp1.000/hari), dan Add-On (+1 Cabang).
 * Secara aman memigrasikan dan menggantikan skema legacy Enterprise menjadi AddOnBranch.
 */
export class LicenseController {
  private static readonly STORAGE_KEY_PLAN = 'bq_license_plan';
  private static readonly STORAGE_KEY_CORE_PERIOD = 'bq_license_core_period';
  private static readonly STORAGE_KEY_ADDON_BRANCH = 'bq_addon_branch_count';

  public static readonly CORE_DAILY_RATE = 1000;

  public static readonly PLANS: Record<LicensePlan, LicensePlanInfo> = {
    [LICENSE_PLAN_ENUM.BASIC]: {
      id: LICENSE_PLAN_ENUM.BASIC,
      name: 'Basic (Freemium)',
      badge: 'Gratis',
      subtitle: 'Gratis / Kasir Dasar',
      dailyRate: 0,
      description: 'Kasir POS dasar, antrian servis standar, dan katalog suku cadang tanpa biaya langganan bulanan.'
    },
    [LICENSE_PLAN_ENUM.CORE]: {
      id: LICENSE_PLAN_ENUM.CORE,
      name: 'Core / Pro',
      badge: 'Paling Populer',
      subtitle: 'Rp1.000 / Hari',
      dailyRate: 1000,
      description: 'Solusi lengkap dengan hak akses role SPV/Kasir, laporan keuangan laba rugi, CRM WhatsApp, dan cadangan database.'
    },
    [LICENSE_PLAN_ENUM.ADD_ON_BRANCH]: {
      id: LICENSE_PLAN_ENUM.ADD_ON_BRANCH,
      name: 'Add-On (+1 Cabang)',
      badge: 'Ekspansi Cabang',
      subtitle: 'Modul Tambah Cabang Opsional',
      description: 'Modul ekspansi multi-cabang terpadu untuk menambah kuota outlet operasional baru.'
    }
  };

  public static readonly DURATION_OPTIONS: CoreDurationOption[] = [
    {
      id: '1_bulan',
      label: '1 Bulan',
      days: 30,
      price: 30000,
      formattedPrice: 'Rp30.000',
      note: 'Rp1.000 / Hari'
    },
    {
      id: '3_bulan',
      label: '3 Bulan',
      days: 90,
      price: 90000,
      formattedPrice: 'Rp90.000',
      badge: 'Hemat',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      note: 'Rp1.000 / Hari'
    },
    {
      id: '6_bulan',
      label: '6 Bulan',
      days: 180,
      price: 180000,
      formattedPrice: 'Rp180.000',
      badge: 'Populer',
      badgeColor: 'bg-blue-100 text-blue-800',
      note: 'Rp1.000 / Hari'
    },
    {
      id: '12_bulan',
      label: '12 Bulan',
      days: 365,
      price: 360000,
      formattedPrice: 'Rp360.000',
      badge: 'Terhemat 1 Tahun',
      badgeColor: 'bg-amber-100 text-amber-800',
      note: 'Rp1.000 / Hari'
    }
  ];

  /**
   * Mengambil paket lisensi aktif saat ini dari database lokal / LocalStorage.
   * Aman dari referensi skema lama (Enterprise otomatis dipetakan ke AddOnBranch).
   */
  public static getCurrentPlan(): LicensePlan {
    try {
      const raw = localStorage.getItem(LicenseController.STORAGE_KEY_PLAN);
      if (raw === LICENSE_PLAN_ENUM.BASIC || raw === LICENSE_PLAN_ENUM.CORE || raw === LICENSE_PLAN_ENUM.ADD_ON_BRANCH) {
        return raw as LicensePlan;
      }
      // Migrasi aman untuk nilai legacy Enterprise
      if (raw === 'Enterprise') {
        LicenseController.setCurrentPlan(LICENSE_PLAN_ENUM.ADD_ON_BRANCH);
        return LICENSE_PLAN_ENUM.ADD_ON_BRANCH;
      }
      // Standar bawaan aplikasi
      return LICENSE_PLAN_ENUM.CORE;
    } catch {
      return LICENSE_PLAN_ENUM.CORE;
    }
  }

  /**
   * Menyimpan paket lisensi terpilih ke LocalStorage.
   */
  public static setCurrentPlan(plan: LicensePlan): void {
    try {
      localStorage.setItem(LicenseController.STORAGE_KEY_PLAN, plan);
    } catch (e) {
      console.warn('Gagal menyimpan lisensi ke localStorage:', e);
    }
  }

  /**
   * Mengambil pilihan periode durasi Core / Pro yang aktif.
   */
  public static getCoreDuration(): LicenseBillingPeriod {
    try {
      const raw = localStorage.getItem(LicenseController.STORAGE_KEY_CORE_PERIOD);
      if (raw === '1_bulan' || raw === '3_bulan' || raw === '6_bulan' || raw === '12_bulan') {
        return raw as LicenseBillingPeriod;
      }
      return '1_bulan';
    } catch {
      return '1_bulan';
    }
  }

  /**
   * Menyimpan pilihan periode durasi Core / Pro.
   */
  public static setCoreDuration(duration: LicenseBillingPeriod): void {
    try {
      localStorage.setItem(LicenseController.STORAGE_KEY_CORE_PERIOD, duration);
    } catch (e) {
      console.warn('Gagal menyimpan durasi core ke localStorage:', e);
    }
  }

  /**
   * Mengambil kuota penambahan cabang untuk Add-On (+1 Cabang).
   */
  public static getAddonBranchCount(): number {
    try {
      const raw = localStorage.getItem(LicenseController.STORAGE_KEY_ADDON_BRANCH);
      if (raw) {
        const parsed = parseInt(raw, 10);
        return isNaN(parsed) || parsed < 1 ? 1 : parsed;
      }
      return 1;
    } catch {
      return 1;
    }
  }

  /**
   * Menyimpan kuota penambahan cabang untuk Add-On (+1 Cabang).
   */
  public static setAddonBranchCount(count: number): void {
    try {
      const safeCount = Math.max(1, count);
      localStorage.setItem(LicenseController.STORAGE_KEY_ADDON_BRANCH, safeCount.toString());
    } catch (e) {
      console.warn('Gagal menyimpan addon branch count ke localStorage:', e);
    }
  }

  /**
   * Mengambil rincian informasi paket lisensi berdasarkan id paket.
   */
  public static getPlanInfo(plan: LicensePlan): LicensePlanInfo {
    return LicenseController.PLANS[plan] || LicenseController.PLANS[LICENSE_PLAN_ENUM.CORE];
  }

  /**
   * Mengambil rincian opsi durasi paket Core berdasarkan id durasi.
   */
  public static getDurationOption(duration: LicenseBillingPeriod): CoreDurationOption {
    const found = LicenseController.DURATION_OPTIONS.find((opt) => opt.id === duration);
    return found || LicenseController.DURATION_OPTIONS[0];
  }

  /**
   * Memeriksa apakah paket aktif merupakan Core / Pro.
   */
  public static isCoreActive(): boolean {
    return LicenseController.getCurrentPlan() === LICENSE_PLAN_ENUM.CORE;
  }

  /**
   * Memeriksa apakah paket aktif merupakan Basic (Freemium).
   */
  public static isBasicActive(): boolean {
    return LicenseController.getCurrentPlan() === LICENSE_PLAN_ENUM.BASIC;
  }

  /**
   * Memeriksa apakah paket aktif merupakan Add-On (+1 Cabang).
   */
  public static isAddonBranchActive(): boolean {
    return LicenseController.getCurrentPlan() === LICENSE_PLAN_ENUM.ADD_ON_BRANCH;
  }
}
