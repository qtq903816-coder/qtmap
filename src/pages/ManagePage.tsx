import { Download, FileUp, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { ChangeEvent, FormEvent, useMemo, useRef, useState } from 'react';
import { RecordList } from '../components/RecordList';
import { useTravelStore } from '../state/travelStore';
import type { ImportPreview, TravelRecord, TravelScope } from '../types';
import { buildImportPreview, createBackup, MAX_IMPORT_BYTES, mergeRecords, validateBackupJson } from '../utils/backup';
import { daysBetweenInclusive, formatBackupTimestamp } from '../utils/date';
import { createRecordId } from '../utils/records';

type FormState = {
  scope: TravelScope;
  countryCode: string;
  countryName: string;
  province: string;
  city: string;
  locationCode: string;
  arrivalDate: string;
  departureDate: string;
  notes: string;
  rating: string;
  photoUrls: string;
  isPlanned: boolean;
};

const initialForm: FormState = {
  scope: 'china',
  countryCode: 'CN',
  countryName: '中国',
  province: '',
  city: '',
  locationCode: '',
  arrivalDate: new Date().toISOString().slice(0, 10),
  departureDate: '',
  notes: '',
  rating: '',
  photoUrls: '',
  isPlanned: false,
};

export function ManagePage() {
  const records = useTravelStore((state) => state.records);
  const settings = useTravelStore((state) => state.settings);
  const addRecord = useTravelStore((state) => state.addRecord);
  const updateRecord = useTravelStore((state) => state.updateRecord);
  const deleteRecord = useTravelStore((state) => state.deleteRecord);
  const replaceAll = useTravelStore((state) => state.replaceAll);
  const clearAll = useTravelStore((state) => state.clearAll);
  const resetSampleData = useTravelStore((state) => state.resetSampleData);
  const [form, setForm] = useState<FormState>(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [keyword, setKeyword] = useState('');
  const [year, setYear] = useState('全部');
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [importError, setImportError] = useState('');
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      if (year !== '全部' && !record.arrivalDate.startsWith(year)) return false;
      if (keyword && !`${record.countryName}${record.city ?? ''}${record.province ?? ''}${record.countryCode}`.toLowerCase().includes(keyword.toLowerCase())) return false;
      return true;
    });
  }, [keyword, records, year]);

  const years = useMemo(() => Array.from(new Set(records.map((record) => record.arrivalDate.slice(0, 4)))).sort((a, b) => b.localeCompare(a)), [records]);
  const stayDays = daysBetweenInclusive(form.arrivalDate, form.departureDate || undefined);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const now = new Date().toISOString();
    const current = editingId ? records.find((record) => record.id === editingId) : undefined;
    const record: TravelRecord = {
      id: current?.id ?? createRecordId(),
      scope: form.scope,
      countryCode: form.countryCode.trim().toUpperCase(),
      countryName: form.countryName.trim(),
      province: form.province.trim() || undefined,
      city: form.city.trim(),
      locationCode: form.locationCode.trim() || undefined,
      arrivalDate: form.arrivalDate,
      departureDate: form.departureDate || undefined,
      notes: form.notes.trim() || undefined,
      rating: form.rating ? Number(form.rating) : undefined,
      photoUrls: form.photoUrls.split('\n').map((url) => url.trim()).filter(Boolean),
      isPlanned: form.isPlanned,
      createdAt: current?.createdAt ?? now,
      updatedAt: now,
    };

    if (editingId) {
      updateRecord(record);
      setMessage('足迹已更新，地图状态已重新计算。');
    } else {
      addRecord(record);
      setMessage('足迹已添加，地图会立即点亮对应区域。');
    }
    setEditingId(null);
    setForm(initialForm);
  }

  function editRecord(record: TravelRecord) {
    setEditingId(record.id);
    setForm({
      scope: record.scope,
      countryCode: record.countryCode,
      countryName: record.countryName,
      province: record.province ?? '',
      city: record.city ?? '',
      locationCode: record.locationCode ?? '',
      arrivalDate: record.arrivalDate,
      departureDate: record.departureDate ?? '',
      notes: record.notes ?? '',
      rating: record.rating ? String(record.rating) : '',
      photoUrls: record.photoUrls?.join('\n') ?? '',
      isPlanned: Boolean(record.isPlanned),
    });
  }

  function exportBackup() {
    const backup = createBackup({ schemaVersion: 1, settings, records });
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `qtmap-backup-${formatBackupTimestamp()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function handleImportFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (file.size > MAX_IMPORT_BYTES) {
      setImportError('文件超过 10MB，已拒绝导入。');
      return;
    }
    const text = await file.text();
    const validation = validateBackupJson(text);
    if (validation.errors.length > 0) {
      setImportError(validation.errors.join(' '));
      return;
    }
    setImportError('');
    setPreview(buildImportPreview(records, validation));
  }

  function mergeImport(choice: 'keep-current' | 'use-imported') {
    if (!preview) return;
    replaceAll(mergeRecords(records, preview.validRecords, choice));
    setMessage(`合并完成：新增 ${preview.newCount} 条，重复 ${preview.duplicateCount} 条，冲突 ${preview.conflictCount} 条。`);
    setPreview(null);
  }

  function overwriteImport() {
    if (!preview) return;
    if (!window.confirm('覆盖恢复会完全替换当前数据。建议先下载备份，确认继续？')) return;
    replaceAll(preview.validRecords);
    setMessage(`覆盖恢复完成，共恢复 ${preview.validRecords.length} 条有效记录。`);
    setPreview(null);
  }

  function confirmClear() {
    if (window.confirm('清空前请确认已经下载备份。确定要清空全部足迹吗？')) {
      clearAll();
      setMessage('全部足迹已清空。');
    }
  }

  function deleteEditingRecord() {
    if (!editingId) return;
    const current = records.find((record) => record.id === editingId);
    if (!current) return;
    if (window.confirm(`确定删除「${current.countryName}${current.city ?? ''}」这条足迹吗？`)) {
      deleteRecord(editingId);
      setEditingId(null);
      setForm(initialForm);
      setMessage('足迹已删除。');
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.42fr_0.58fr]">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold">{editingId ? '编辑足迹' : '添加足迹'}</h1>
          {editingId ? (
            <button type="button" onClick={deleteEditingRecord} className="rounded-lg border border-clay/25 px-3 py-2 text-sm font-medium text-clay hover:bg-clay/5">
              删除当前
            </button>
          ) : null}
        </div>
        <form onSubmit={handleSubmit} className="mt-5 grid gap-3">
          <div className="grid grid-cols-2 gap-3">
            <label className="field">范围<select className="control mt-1 w-full" value={form.scope} onChange={(event) => setForm({ ...form, scope: event.target.value as TravelScope, countryCode: event.target.value === 'china' ? 'CN' : '', countryName: event.target.value === 'china' ? '中国' : '' })}><option value="china">中国</option><option value="world">世界</option></select></label>
            <label className="field">国家代码<input required className="control mt-1 w-full" value={form.countryCode} onChange={(event) => setForm({ ...form, countryCode: event.target.value })} /></label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="field">国家<input required className="control mt-1 w-full" value={form.countryName} onChange={(event) => setForm({ ...form, countryName: event.target.value })} /></label>
            <label className="field">省份<input className="control mt-1 w-full" value={form.province} onChange={(event) => setForm({ ...form, province: event.target.value })} /></label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="field">城市<input required className="control mt-1 w-full" value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} /></label>
            <label className="field">行政/国家代码<input className="control mt-1 w-full" value={form.locationCode} onChange={(event) => setForm({ ...form, locationCode: event.target.value })} /></label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="field">到达日期<input required type="date" className="control mt-1 w-full" value={form.arrivalDate} onChange={(event) => setForm({ ...form, arrivalDate: event.target.value })} /></label>
            <label className="field">离开日期<input type="date" className="control mt-1 w-full" value={form.departureDate} onChange={(event) => setForm({ ...form, departureDate: event.target.value })} /></label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="field">停留天数<input readOnly className="control mt-1 w-full" value={`${stayDays} 天`} /></label>
            <label className="field">评分<input min="1" max="5" type="number" className="control mt-1 w-full" value={form.rating} onChange={(event) => setForm({ ...form, rating: event.target.value })} /></label>
          </div>
          <label className="field">旅行感受<textarea className="control mt-1 min-h-24 w-full" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} /></label>
          <label className="field">图片链接<textarea className="control mt-1 min-h-20 w-full" placeholder="每行一个链接" value={form.photoUrls} onChange={(event) => setForm({ ...form, photoUrls: event.target.value })} /></label>
          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-fog"><input type="checkbox" checked={form.isPlanned} onChange={(event) => setForm({ ...form, isPlanned: event.target.checked })} />计划中的旅行</label>
          <button type="submit" className="inline-flex items-center justify-center rounded-xl bg-clay px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-clay/90"><Plus className="mr-2" size={17} />{editingId ? '保存修改' : '保存足迹'}</button>
        </form>
      </section>

      <section className="space-y-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={exportBackup} className="action"><Download size={16} />备份全部数据</button>
            <button type="button" onClick={() => fileInputRef.current?.click()} className="action"><FileUp size={16} />导入备份</button>
            <button type="button" onClick={resetSampleData} className="action"><RotateCcw size={16} />重置初版数据</button>
            <button type="button" onClick={confirmClear} className="action danger"><Trash2 size={16} />清空数据</button>
            <input ref={fileInputRef} type="file" accept=".json,application/json" className="hidden" onChange={handleImportFile} />
          </div>
          {message ? <p className="mt-3 text-sm text-moss dark:text-[#b9d4be]">{message}</p> : null}
          {importError ? <p className="mt-3 text-sm text-clay">{importError}</p> : null}
        </div>

        {preview ? (
          <div className="rounded-3xl border border-clay/25 bg-clay/5 p-4 shadow-sm dark:bg-clay/10">
            <h2 className="text-lg font-semibold">导入预览</h2>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
              <PreviewItem label="导出时间" value={preview.exportedAt ? new Date(preview.exportedAt).toLocaleString() : '未知'} />
              <PreviewItem label="版本" value={preview.appVersion ?? '未知'} />
              <PreviewItem label="新增" value={preview.newCount} />
              <PreviewItem label="重复" value={preview.duplicateCount} />
              <PreviewItem label="冲突" value={preview.conflictCount} />
              <PreviewItem label="无效" value={preview.invalidCount} />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button className="action" onClick={() => mergeImport('keep-current')}>合并，冲突保留当前</button>
              <button className="action" onClick={() => mergeImport('use-imported')}>合并，冲突使用导入</button>
              <button className="action danger" onClick={overwriteImport}>覆盖恢复</button>
              <button className="action" onClick={() => setPreview(null)}>取消</button>
            </div>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <input className="control min-w-60" placeholder="搜索记录" value={keyword} onChange={(event) => setKeyword(event.target.value)} />
          <select className="control" value={year} onChange={(event) => setYear(event.target.value)}>
            <option>全部</option>
            {years.map((item) => <option key={item}>{item}</option>)}
          </select>
        </div>
        <RecordList records={filteredRecords} onSelect={editRecord} />
      </section>
    </div>
  );
}

function PreviewItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-white/5">
      <p className="text-xs text-slate-500 dark:text-fog">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}
