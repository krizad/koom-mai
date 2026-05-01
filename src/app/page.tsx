"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Image from "next/image";
import { Plus, Trash2, RotateCcw, TrendingDown, Tag, Hash, CheckCircle2, LayoutGrid, ChevronDown, Package, Equal, BookmarkPlus, History, Undo2, Clock3, X } from "lucide-react";

const publicBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

type UnitInfo = { label: string; multiplier: number };
type CategoryInfo = {
  label: string;
  baseUnitLabel: string;
  units: Record<string, UnitInfo>;
};

const unitData: Record<string, CategoryInfo> = {
  default: {
    label: "-",
    baseUnitLabel: "หน่วย",
    units: {
      unit: { label: "หน่วย", multiplier: 1 },
    },
  },
  weight: {
    label: "น้ำหนัก (Weight)",
    baseUnitLabel: "กรัม",
    units: {
      g: { label: "กรัม (g)", multiplier: 1 },
      kg: { label: "กิโลกรัม (kg)", multiplier: 1000 },
      mg: { label: "มิลลิกรัม (mg)", multiplier: 0.001 },
      oz: { label: "ออนซ์ (oz)", multiplier: 28.3495 },
      lb: { label: "ปอนด์ (lb)", multiplier: 453.592 },
    },
  },
  volume: {
    label: "ปริมาตร (Volume)",
    baseUnitLabel: "มิลลิลิตร",
    units: {
      ml: { label: "มิลลิลิตร (ml)", multiplier: 1 },
      l: { label: "ลิตร (l)", multiplier: 1000 },
      floz: { label: "ออนซ์ของเหลว (fl oz)", multiplier: 29.5735 },
      gal: { label: "แกลลอน (gal)", multiplier: 3785.41 },
    },
  },
  length: {
    label: "ความยาว (Length)",
    baseUnitLabel: "เซนติเมตร",
    units: {
      cm: { label: "เซนติเมตร (cm)", multiplier: 1 },
      m: { label: "เมตร (m)", multiplier: 100 },
      mm: { label: "มิลลิเมตร (mm)", multiplier: 0.1 },
      in: { label: "นิ้ว (in)", multiplier: 2.54 },
      ft: { label: "ฟุต (ft)", multiplier: 30.48 },
    },
  },
  pieces: {
    label: "จำนวน (Quantity)",
    baseUnitLabel: "ชิ้น",
    units: {
      pcs: { label: "ชิ้น (pcs)", multiplier: 1 },
      dozen: { label: "โหล (dozen)", multiplier: 12 },
    },
  },
};

type Item = {
  id: string;
  name: string;
  price: string;
  quantity: string;
  unit: string;
};

type ProcessedItem = Item & {
  isValid: boolean;
  unitMultiplier: number;
  pricePerBaseUnit: number | null;
  pricePerItemUnit: number | null;
};

type SavedComparison = {
  id: string;
  createdAt: number;
  category: string;
  items: Item[];
};

type CustomSelectProps = Readonly<{
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
  className?: string;
  ariaLabel?: string;
}>;

const generateId = () => Math.random().toString(36).slice(2, 11);

const cloneItems = (items: Item[]) => items.map((item) => ({ ...item }));

const getShortUnitLabel = (category: string, unit: string) => unitData[category].units[unit]?.label.split(" ")[0] || "หน่วย";

function getDefaultItems(category: string) {
  const defaultUnit = Object.keys(unitData[category].units)[0];

  return [
    { id: generateId(), name: "สินค้า A", price: "", quantity: "", unit: defaultUnit },
    { id: generateId(), name: "สินค้า B", price: "", quantity: "", unit: defaultUnit },
  ];
}

function analyzeComparison(category: string, items: Item[]) {
  const processedItems: ProcessedItem[] = items.map((item) => {
    const price = Number.parseFloat(item.price);
    const quantity = Number.parseFloat(item.quantity);
    const isValid = !Number.isNaN(price) && !Number.isNaN(quantity) && quantity > 0;

    const unitMultiplier = unitData[category].units[item.unit]?.multiplier || 1;
    const baseQuantity = quantity * unitMultiplier;

    const pricePerBaseUnit = isValid ? price / baseQuantity : null;
    const pricePerItemUnit = isValid ? price / quantity : null;

    return {
      ...item,
      isValid,
      unitMultiplier,
      pricePerBaseUnit,
      pricePerItemUnit,
    };
  });

  const validItems = processedItems.filter((item) => item.isValid && item.pricePerBaseUnit !== null);

  let maxPricePerBaseUnit = 0;
  let minPricePerBaseUnit = Infinity;

  if (validItems.length > 1) {
    validItems.forEach((item) => {
      if (item.pricePerBaseUnit! < minPricePerBaseUnit) {
        minPricePerBaseUnit = item.pricePerBaseUnit!;
      }
      if (item.pricePerBaseUnit! > maxPricePerBaseUnit) {
        maxPricePerBaseUnit = item.pricePerBaseUnit!;
      }
    });
  }

  const isAllEqual =
    validItems.length > 1 &&
    minPricePerBaseUnit !== Infinity &&
    Math.abs(minPricePerBaseUnit - maxPricePerBaseUnit) < 0.000001;

  return {
    processedItems,
    validItems,
    maxPricePerBaseUnit,
    minPricePerBaseUnit,
    isAllEqual,
  };
}

function formatSavedTime(timestamp: number) {
  return new Intl.DateTimeFormat("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    day: "2-digit",
    month: "short",
  }).format(timestamp);
}

function getSavingsMeta(
  item: ProcessedItem,
  isBestValue: boolean,
  isAllEqual: boolean,
  minPricePerBaseUnit: number,
  maxPricePerBaseUnit: number,
) {
  if (isBestValue && maxPricePerBaseUnit > minPricePerBaseUnit) {
    const savingsPercentage = ((maxPricePerBaseUnit - minPricePerBaseUnit) / maxPricePerBaseUnit) * 100;

    return {
      savingsPercentage,
      savingsText: `ประหยัด ${savingsPercentage.toFixed(0)}%`,
    };
  }

  if (!isBestValue && !isAllEqual && item.isValid && minPricePerBaseUnit < Infinity && item.pricePerBaseUnit! > minPricePerBaseUnit) {
    const extraCost = ((item.pricePerBaseUnit! - minPricePerBaseUnit) / minPricePerBaseUnit) * 100;

    return {
      savingsPercentage: 0,
      savingsText: `แพงกว่า ${extraCost.toFixed(0)}%`,
    };
  }

  return {
    savingsPercentage: 0,
    savingsText: "",
  };
}

function getCurrentCardClasses(isBestValue: boolean, isComparisonEqual: boolean) {
  if (isBestValue) {
    return {
      cardClass: "border-green-500 ring-4 ring-green-50 shadow-green-100",
      dividerClass: "border-green-100",
      resultTextClass: "text-green-600",
    };
  }

  if (isComparisonEqual) {
    return {
      cardClass: "border-blue-400 ring-4 ring-blue-50/50 shadow-blue-50",
      dividerClass: "border-slate-100",
      resultTextClass: "text-blue-600",
    };
  }

  return {
    cardClass: "border-slate-100 hover:border-slate-200",
    dividerClass: "border-slate-100",
    resultTextClass: "text-slate-800",
  };
}

function getSnapshotSummaryText(snapshot: ReturnType<typeof analyzeComparison>, bestItemName?: string) {
  if (snapshot.isAllEqual) {
    return "ผลลัพธ์ใน snapshot นี้ราคาเท่ากันทุกรายการ";
  }

  if (bestItemName) {
    return `ตัวที่คุ้มค่าที่สุด: ${bestItemName}`;
  }

  return "snapshot นี้มีข้อมูลไม่พอสำหรับการเปรียบเทียบ";
}

function CustomSelect({
  value,
  onChange,
  options,
  className = "",
  ariaLabel,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((o) => o.value === value) || options[0];

  return (
    <div className={`relative ${className}`} ref={selectRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={ariaLabel}
        className="w-full flex items-center justify-between outline-none bg-slate-50 border border-slate-200 text-slate-800 font-semibold rounded-2xl pl-4 pr-4 py-3 sm:py-3.5 text-base focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
      >
        <span className="truncate">{selectedOption?.label}</span>
        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white/95 backdrop-blur-xl border border-slate-100 rounded-2xl shadow-xl max-h-60 overflow-auto py-2 animate-in fade-in zoom-in-95 duration-100">
          {options.map((option) => (
            (() => {
              const isSelected = value === option.value;
              const optionPaddingClass = isSelected ? "" : "pl-6";

              return (
            <button
              key={option.value}
              type="button"
              className={`w-full text-left px-4 py-3 text-sm sm:text-base transition-colors flex items-center gap-2 ${
                isSelected ? "bg-blue-50/50 text-blue-700 font-bold" : "text-slate-700 font-medium hover:bg-slate-50"
              }`}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />}
              <span className={optionPaddingClass}>{option.label}</span>
            </button>
              );
            })()
          ))}
        </div>
      )}
    </div>
  );
}

export default function PriceCompareApp() {
  const [category, setCategory] = useState<string>("default");
  const [items, setItems] = useState<Item[]>(() => getDefaultItems("default"));
  const [savedComparisons, setSavedComparisons] = useState<SavedComparison[]>([]);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  useEffect(() => {
    if (!isHistoryModalOpen) {
      return undefined;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsHistoryModalOpen(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    globalThis.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      globalThis.removeEventListener("keydown", handleEscape);
    };
  }, [isHistoryModalOpen]);

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    const defaultUnit = Object.keys(unitData[newCategory].units)[0];
    setItems((currentItems) => currentItems.map((item) => ({ ...item, unit: defaultUnit })));
  };

  const handleAddItem = () => {
    setItems((currentItems) => [
      ...currentItems,
      {
        id: generateId(),
        name: `สินค้า ${String.fromCodePoint(65 + currentItems.length)}`,
        price: "",
        quantity: "",
        unit: currentItems[0]?.unit || Object.keys(unitData[category].units)[0],
      },
    ]);
  };

  const handleRemoveItem = (id: string) => {
    setItems((currentItems) => currentItems.filter((item) => item.id !== id));
  };

  const handleClearAll = () => {
    setItems(getDefaultItems(category));
  };

  const updateItem = (id: string, field: keyof Item, value: string) => {
    setItems((currentItems) => currentItems.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const handleSaveComparison = () => {
    setSavedComparisons((currentHistory) => [
      {
        id: generateId(),
        createdAt: Date.now(),
        category,
        items: cloneItems(items),
      },
      ...currentHistory,
    ]);
  };

  const handleRestoreComparison = (comparison: SavedComparison) => {
    setCategory(comparison.category);
    setItems(cloneItems(comparison.items));
  };

  const handleDeleteComparison = (comparisonId: string) => {
    setSavedComparisons((currentHistory) => currentHistory.filter((comparison) => comparison.id !== comparisonId));
  };

  const openHistoryModal = () => {
    setIsHistoryModalOpen(true);
  };

  const closeHistoryModal = () => {
    setIsHistoryModalOpen(false);
  };

  // Calculations
  const { processedItems, validItems, maxPricePerBaseUnit, minPricePerBaseUnit, isAllEqual } = useMemo(
    () => analyzeComparison(category, items),
    [items, category],
  );

  const canSaveComparison = validItems.length >= 2;

  return (
    <div className="min-h-dvh bg-slate-50 text-slate-900 py-6 px-3 sm:px-6 lg:px-8 font-sans selection:bg-blue-100 selection:text-blue-900 pb-24">
      <div className="max-w-xl mx-auto space-y-5">
        
        {/* Header */}
        <div className="text-center space-y-4 pt-6 pb-2">
          <div className="flex justify-center">
            <div className="relative group">
              <div className="absolute -inset-1 bg-linear-to-r from-blue-100 to-indigo-100 rounded-[2.2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <Image 
                src={`${publicBasePath}/logo.png`} 
                alt="Price Compare Logo" 
                width={80} 
                height={80} 
                className="relative w-20 h-20 rounded-4xl shadow-xl border-4 border-white ring-1 ring-slate-100" 
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
              เปรียบเทียบราคา
            </h1>
            <p className="text-sm sm:text-base text-slate-500 font-semibold tracking-wide">ค้นหาความคุ้มค่าที่สุดได้ทันที</p>
          </div>
        </div>

        {/* Category Selector */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-3.5 transition-shadow hover:shadow-md">
          <div className="flex items-center gap-2.5 px-1">
            <div className="p-1.5 bg-slate-50 rounded-lg text-slate-400">
              <LayoutGrid className="w-4 h-4" />
            </div>
            <p className="text-sm font-extrabold text-slate-600 uppercase tracking-wider">หมวดหมู่การเปรียบเทียบ</p>
          </div>
          <CustomSelect
            value={category}
            onChange={handleCategoryChange}
            options={Object.entries(unitData).map(([key, data]) => ({
              value: key,
              label: data.label,
            }))}
            className="w-full"
            ariaLabel="หมวดหมู่การเปรียบเทียบ"
          />
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={handleClearAll}
            className="flex justify-center items-center gap-2 px-4 py-3.5 text-sm sm:text-base font-bold text-red-600 bg-white border border-red-100 shadow-sm hover:bg-red-50 active:scale-[0.98] rounded-2xl transition-all"
          >
            <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
            เริ่มใหม่
          </button>
          <button
            onClick={handleSaveComparison}
            disabled={!canSaveComparison}
            className="flex justify-center items-center gap-2 px-4 py-3.5 text-sm sm:text-base font-bold text-amber-700 bg-amber-50 border border-amber-100 shadow-sm hover:bg-amber-100 active:scale-[0.98] rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-amber-50"
          >
            <BookmarkPlus className="w-4 h-4 sm:w-5 sm:h-5" />
            บันทึกชั่วคราว
          </button>
          <button
            onClick={handleAddItem}
            className="flex justify-center items-center gap-2 px-4 py-3.5 text-sm sm:text-base font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] shadow-md hover:shadow-lg rounded-2xl transition-all"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            เพิ่มรายการ
          </button>
        </div>

        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-amber-50 rounded-lg text-amber-500">
                  <History className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-extrabold text-slate-700 uppercase tracking-wider">รายการที่บันทึกชั่วคราว</h2>
              </div>
              <p className="text-sm text-slate-500 font-medium">ดูได้จนกว่าจะรีเฟรชหน้าเว็บ</p>
            </div>
            <button
              type="button"
              onClick={openHistoryModal}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <History className="w-4 h-4" />
              ดูรายการ ({savedComparisons.length})
            </button>
          </div>
        </div>

        {/* Cards list */}
        <div className="space-y-4">
          {/* Equal Price Alert */}
          {isAllEqual && (
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-center gap-3 text-blue-800 animate-in fade-in slide-in-from-top-2 duration-500">
              <div className="bg-blue-100 p-2 rounded-xl">
                <Equal className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-extrabold uppercase tracking-tight">ราคาเท่ากันทุกรายการ</p>
                <p className="text-xs font-medium text-blue-600/80">คุ้มค่าเท่ากัน เลือกรายการไหนก็ได้</p>
              </div>
            </div>
          )}

          {processedItems.map((item) => {
            const isBestValue = !isAllEqual && validItems.length > 1 && item.isValid && Math.abs(item.pricePerBaseUnit! - minPricePerBaseUnit) < 0.000001;
            const isComparisonEqual = isAllEqual && item.isValid;
            const { savingsText, savingsPercentage } = getSavingsMeta(
              item,
              isBestValue,
              isAllEqual,
              minPricePerBaseUnit,
              maxPricePerBaseUnit,
            );
            const currentUnitLabel = getShortUnitLabel(category, item.unit);
            const { cardClass, dividerClass, resultTextClass } = getCurrentCardClasses(isBestValue, isComparisonEqual);

            return (
              <div
                key={item.id}
                className={`relative flex flex-col p-5 sm:p-6 bg-white rounded-3xl shadow-sm border-2 transition-all duration-300 ${cardClass}`}
              >
                {/* Badge for Best Value */}
                {isBestValue && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-1.5 rounded-full text-xs font-extrabold tracking-wide flex items-center gap-1.5 shadow-md whitespace-nowrap z-10">
                    <CheckCircle2 className="w-4 h-4" />
                    คุ้มค่าที่สุด {savingsPercentage > 0 && `• ${savingsText}`}
                  </div>
                )}

                {/* Badge for Equal Value */}
                {isComparisonEqual && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-4 py-1.5 rounded-full text-xs font-extrabold tracking-wide flex items-center gap-1.5 shadow-md whitespace-nowrap z-10">
                    <Equal className="w-4 h-4" />
                    ราคาเท่ากัน
                  </div>
                )}

                <div className="flex justify-between items-start mb-5 pt-2 gap-3">
                  <div className="space-y-1.5 flex-1">
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 ml-1">
                      <Package className="w-3 h-3" /> ชื่อสินค้า
                    </span>
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => updateItem(item.id, "name", e.target.value)}
                      aria-label={`ชื่อสินค้า ${item.name || item.id}`}
                      placeholder="ชื่อสินค้า (ไม่บังคับ)"
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-bold rounded-2xl px-4 py-3 sm:py-3.5 text-lg focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm"
                    />
                  </div>
                  {items.length > 2 && (
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-slate-300 hover:text-red-500 bg-slate-50 hover:bg-red-50 rounded-2xl p-3.5 mt-6 transition-colors active:scale-95 border border-slate-100"
                      aria-label="ลบรายการ"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-5">
                  {/* Price */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 ml-1">
                      <Tag className="w-3 h-3" /> ราคา (฿)
                    </span>
                    <input
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="any"
                      value={item.price}
                      onChange={(e) => updateItem(item.id, "price", e.target.value)}
                      aria-label={`ราคา ${item.name || item.id}`}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-semibold rounded-2xl px-4 py-3 sm:py-3.5 text-base focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm"
                      placeholder="0.00"
                    />
                  </div>

                  {/* Quantity */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 ml-1">
                      <Hash className="w-3 h-3" /> ปริมาณ
                    </span>
                    <input
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="any"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, "quantity", e.target.value)}
                      aria-label={`ปริมาณ ${item.name || item.id}`}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-semibold rounded-2xl px-4 py-3 sm:py-3.5 text-base focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm"
                      placeholder="0"
                    />
                  </div>

                  {/* Unit */}
                  <div className="space-y-1.5 col-span-2 sm:col-span-1">
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 ml-1">
                      <TrendingDown className="w-3 h-3" /> หน่วย
                    </span>
                    <CustomSelect
                      value={item.unit}
                      onChange={(val) => updateItem(item.id, "unit", val)}
                      options={Object.entries(unitData[category].units).map(([unitKey, unitVal]) => ({
                        value: unitKey,
                        label: unitVal.label,
                      }))}
                      ariaLabel={`หน่วยของ ${item.name || item.id}`}
                    />
                  </div>
                </div>

                {/* Result */}
                <div className={`mt-auto pt-4 border-t flex justify-between items-end ${dividerClass}`}>
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-500 font-bold mb-0.5">ราคาต่อ 1 {currentUnitLabel}</span>
                    {item.isValid ? (
                      <>
                        <span className={`text-2xl font-extrabold tracking-tight ${resultTextClass}`}>
                          ฿{item.pricePerItemUnit!.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                        </span>
                        {item.unitMultiplier !== 1 && (
                          <span className="text-[11px] font-medium text-slate-400 mt-1">
                            (เทียบเท่า ฿{item.pricePerBaseUnit!.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} / {unitData[category].baseUnitLabel})
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-2xl font-extrabold text-slate-300 tracking-tight">--</span>
                    )}
                  </div>
                  {!isBestValue && item.isValid && savingsText && (
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-100 px-2.5 py-1.5 rounded-lg mb-1 shadow-sm">
                      {savingsText}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {isHistoryModalOpen && (
        <dialog
          open
          className="fixed inset-0 z-50 m-0 h-dvh w-full bg-slate-900/40 backdrop-blur-[2px] px-3 sm:px-6 py-8"
          onCancel={closeHistoryModal}
          aria-labelledby="temporary-history-modal-title"
        >
          <div
            className="max-w-3xl mx-auto max-h-[calc(100dvh-4rem)] overflow-hidden rounded-4xl bg-white shadow-2xl border border-slate-100 flex flex-col"
          >
            <div className="flex items-start justify-between gap-3 px-5 sm:px-6 py-5 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-amber-50 rounded-lg text-amber-500">
                    <History className="w-4 h-4" />
                  </div>
                  <h2 id="temporary-history-modal-title" className="text-base sm:text-lg font-extrabold text-slate-800 tracking-tight">
                    รายการที่บันทึกชั่วคราว
                  </h2>
                </div>
                <p className="text-sm text-slate-500 font-medium">
                  เก็บไว้เฉพาะระหว่างที่ยังไม่รีเฟรชหน้าเว็บเท่านั้น
                </p>
              </div>
              <button
                type="button"
                onClick={closeHistoryModal}
                className="shrink-0 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                aria-label="ปิดรายการบันทึกชั่วคราว"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto px-5 sm:px-6 py-5 space-y-4 bg-slate-50/60">
              {!canSaveComparison && (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 font-medium">
                  ใส่ข้อมูลให้ถูกต้องอย่างน้อย 2 รายการก่อน แล้วค่อยบันทึกการเปรียบเทียบ
                </div>
              )}

              {savedComparisons.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-8 text-sm text-slate-500 font-medium text-center">
                  ยังไม่มีรายการที่บันทึกไว้ชั่วคราว — กด “บันทึกชั่วคราว” ได้เลย
                </div>
              ) : (
                <div className="space-y-3">
                  {savedComparisons.map((comparison, index) => {
                    const snapshot = analyzeComparison(comparison.category, comparison.items);
                    const bestItem = snapshot.validItems.find(
                      (snapshotItem) =>
                        !snapshot.isAllEqual &&
                        Math.abs(snapshotItem.pricePerBaseUnit! - snapshot.minPricePerBaseUnit) < 0.000001,
                    );
                    const snapshotSummaryText = getSnapshotSummaryText(snapshot, bestItem?.name || "ไม่ระบุชื่อสินค้า");

                    return (
                      <div
                        key={comparison.id}
                        className="rounded-2xl border border-slate-100 bg-white p-4 space-y-3 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm font-extrabold text-slate-700">
                              <Clock3 className="w-4 h-4 text-slate-400" />
                              บันทึกครั้งที่ {savedComparisons.length - index}
                            </div>
                            <p className="text-xs text-slate-500 font-medium">{formatSavedTime(comparison.createdAt)} • {unitData[comparison.category].label}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                handleRestoreComparison(comparison);
                                closeHistoryModal();
                              }}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-bold text-blue-700 border border-blue-100 hover:bg-blue-50 transition-colors"
                            >
                              <Undo2 className="w-3.5 h-3.5" />
                              โหลดกลับ
                            </button>
                            <button
                              onClick={() => handleDeleteComparison(comparison.id)}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-bold text-red-600 border border-red-100 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              ลบ
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {comparison.items.map((snapshotItem) => {
                            const processedSnapshotItem = snapshot.processedItems.find((item) => item.id === snapshotItem.id);
                            const isSnapshotBest =
                              !snapshot.isAllEqual &&
                              processedSnapshotItem?.isValid &&
                              Math.abs(processedSnapshotItem.pricePerBaseUnit! - snapshot.minPricePerBaseUnit) < 0.000001;

                            return (
                              <div
                                key={snapshotItem.id}
                                className={`rounded-2xl border px-3.5 py-3 bg-white ${
                                  isSnapshotBest ? "border-green-200 bg-green-50/40" : "border-slate-100"
                                }`}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <p className="text-sm font-extrabold text-slate-800 line-clamp-1">{snapshotItem.name || "ไม่ระบุชื่อสินค้า"}</p>
                                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                                      {snapshotItem.quantity || "0"} {getShortUnitLabel(comparison.category, snapshotItem.unit)} • ฿{snapshotItem.price || "0"}
                                    </p>
                                  </div>
                                  {isSnapshotBest && (
                                    <span className="text-[11px] font-extrabold text-green-700 bg-green-100 px-2 py-1 rounded-full whitespace-nowrap">
                                      คุ้มสุด
                                    </span>
                                  )}
                                  {snapshot.isAllEqual && processedSnapshotItem?.isValid && (
                                    <span className="text-[11px] font-extrabold text-blue-700 bg-blue-100 px-2 py-1 rounded-full whitespace-nowrap">
                                      เท่ากัน
                                    </span>
                                  )}
                                </div>
                                <div className="mt-3 text-sm font-bold text-slate-700">
                                  {processedSnapshotItem?.isValid
                                    ? `฿${processedSnapshotItem.pricePerItemUnit!.toLocaleString(undefined, {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 4,
                                      })} / ${getShortUnitLabel(comparison.category, snapshotItem.unit)}`
                                    : "ข้อมูลยังไม่ครบ"}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <div className="rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3 text-sm text-slate-600 font-medium">
                          {snapshotSummaryText}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
}
