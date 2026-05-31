import { create } from "zustand";

export type CurrencyCode = "RWF" | "USD" | "EUR" | "KES";

export interface CurrencyRates {
  USD_to_RWF: number;
  EUR_to_RWF: number;
  KES_to_RWF: number;
}

export interface CurrencyState {
  activeCurrency: CurrencyCode;
  rates: CurrencyRates;
  setActiveCurrency: (currency: CurrencyCode) => void;
  setRates: (rates: Partial<CurrencyRates>) => void;
  convertFromRWF: (amountRwf: number, toCurrency?: CurrencyCode) => number;
  convertToRWF: (amount: number, fromCurrency: CurrencyCode) => number;
  formatAmount: (amountRwf: number, targetCurrency?: CurrencyCode) => string;
}

const DEFAULT_RATES: CurrencyRates = {
  USD_to_RWF: 1300,
  EUR_to_RWF: 1400,
  KES_to_RWF: 10,
};

const getSavedCurrency = (): CurrencyCode => {
  const saved = localStorage.getItem("impacto_active_currency");
  if (saved && ["RWF", "USD", "EUR", "KES"].includes(saved)) {
    return saved as CurrencyCode;
  }
  return "RWF";
};

export const useCurrencyStore = create<CurrencyState>((set, get) => ({
  activeCurrency: getSavedCurrency(),
  rates: DEFAULT_RATES,
  setActiveCurrency: (currency) => {
    localStorage.setItem("impacto_active_currency", currency);
    set({ activeCurrency: currency });
  },
  setRates: (newRates) => {
    set((state) => ({
      rates: { ...state.rates, ...newRates },
    }));
  },
  convertFromRWF: (amountRwf, toCurrency) => {
    const target = toCurrency || get().activeCurrency;
    const { rates } = get();
    if (target === "RWF") return amountRwf;
    if (target === "USD") return amountRwf / rates.USD_to_RWF;
    if (target === "EUR") return amountRwf / rates.EUR_to_RWF;
    if (target === "KES") return amountRwf / rates.KES_to_RWF;
    return amountRwf;
  },
  convertToRWF: (amount, fromCurrency) => {
    const { rates } = get();
    if (fromCurrency === "RWF") return amount;
    if (fromCurrency === "USD") return amount * rates.USD_to_RWF;
    if (fromCurrency === "EUR") return amount * rates.EUR_to_RWF;
    if (fromCurrency === "KES") return amount * rates.KES_to_RWF;
    return amount;
  },
  formatAmount: (amountRwf, targetCurrency) => {
    const curr = targetCurrency || get().activeCurrency;
    const converted = get().convertFromRWF(amountRwf, curr);
    
    // Format options matching standard currencies
    const symbolMap: Record<CurrencyCode, string> = {
      RWF: " RWF",
      USD: "$",
      EUR: "€",
      KES: " KES",
    };

    const isAfter = ["RWF", "KES"].includes(curr);
    const formattedVal = converted.toLocaleString(undefined, {
      minimumFractionDigits: curr === "RWF" ? 0 : 2,
      maximumFractionDigits: curr === "RWF" ? 0 : 2,
    });

    return isAfter ? `${formattedVal}${symbolMap[curr]}` : `${symbolMap[curr]}${formattedVal}`;
  },
}));
