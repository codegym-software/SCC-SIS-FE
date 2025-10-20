import React, { useMemo, useState } from 'react';
import { X, Upload, Download, AlertTriangle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { createStudent } from '@/shared/api/students';
import type { CreateStudentDto } from '@/shared/types/student';
import { useToast } from '@/shared/hooks/useToast';

type Props = { open: boolean; onClose: () => void; onSuccess: () => void; };
type ParsedRow = Record<string, any>;

const VI_HEADERS = [
    'Họ và tên',
    'Email',
    'Số điện thoại',
    'Ngày sinh (YYYY-MM-DD)',
    'Giới tính (Nam/Nữ/Khác)',
    'Số CMND/CCCD',
    'Địa chỉ',
    'Tỉnh/Thành phố',
    'Quận/Huyện',
    'Phường/Xã',
    'Ghi chú',
];

function normalizeGender(g: string | undefined): 'MALE' | 'FEMALE' | 'OTHER' | null {
    const v = (g || '').toString().trim().toLowerCase();
    if (!v) return null;
    if (['nam', 'male', 'm'].includes(v)) return 'MALE';
    if (['nữ', 'nu', 'female', 'f'].includes(v)) return 'FEMALE';
    return 'OTHER';
}

function toDateISO(input: any): string | null {
    if (input == null || input === '') return null;
    if (typeof input === 'number') {
        try {
            const d = (XLSX as any).SSF.parse_date_code(input);
            const y = d.y;
            const m = String(d.m).padStart(2, '0');
            const day = String(d.d).padStart(2, '0');
            return `${y}-${m}-${day}`;
        } catch {}
    }
    const s = String(input).trim();
    if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(s)) {
        const [y, m, d] = s.split('-').map(Number);
        return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(s)) {
        const [d, m, y] = s.split('/').map(Number);
        return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }
    const dt = new Date(s);
    if (!isNaN(+dt)) {
        const y = dt.getFullYear();
        const m = String(dt.getMonth() + 1).padStart(2, '0');
        const d = String(dt.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }
    return null;
}

type ValidatedRow = { payload?: CreateStudentDto; errors: string[]; source: ParsedRow; };

export default function ImportStudentsModal({ open, onClose, onSuccess }: Props) {
    const { success, error, info } = useToast();
    const [file, setFile] = useState<File | null>(null);
    const [rows, setRows] = useState<ParsedRow[]>([]);
    const [validated, setValidated] = useState<ValidatedRow[]>([]);
    const [importing, setImporting] = useState(false);
    const [progress, setProgress] = useState(0);

    const stats = useMemo(() => {
        const total = validated.length;
        const valid = validated.filter(r => r.errors.length === 0 && r.payload).length;
        return { total, valid, invalid: total - valid };
    }, [validated]);

    const handlePick = async (f: File) => {
        setFile(f);
        setRows([]);
        setValidated([]);
        setProgress(0);

        const ab = await f.arrayBuffer();
        const wb = XLSX.read(ab, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const parsed = XLSX.utils.sheet_to_json<ParsedRow>(ws, { defval: '' });
        setRows(parsed);

        const next = parsed.map((r): ValidatedRow => {
            const fullName = (r['Họ và tên'] ?? '').toString().trim();
            const email = (r['Email'] ?? '').toString().trim();
            const phone = (r['Số điện thoại'] ?? '').toString().trim();
            const dob = toDateISO(r['Ngày sinh (YYYY-MM-DD)']);
            const gender = normalizeGender(r['Giới tính (Nam/Nữ/Khác)']);
            const nationalIdNo = (r['Số CMND/CCCD'] ?? '').toString().trim() || null;
            const addressLine = (r['Địa chỉ'] ?? '').toString().trim() || null;
            const province = (r['Tỉnh/Thành phố'] ?? '').toString().trim() || null;
            const district = (r['Quận/Huyện'] ?? '').toString().trim() || null;
            const ward = (r['Phường/Xã'] ?? '').toString().trim() || null;
            const note = (r['Ghi chú'] ?? '').toString().trim() || null;

            const errs: string[] = [];
            if (!fullName || fullName.length < 2) errs.push('Họ và tên bắt buộc (>=2 ký tự)');
            if (!email) errs.push('Email bắt buộc');
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.push('Email không hợp lệ');
            if (!phone) errs.push('Số ĐT bắt buộc');
            else if (!/^\d{9,11}$/.test(phone.replace(/\s/g, ''))) errs.push('Số ĐT phải có 9-11 chữ số');

            const payload: CreateStudentDto = {
                fullName,
                email,
                phone,
                dob,
                gender,
                nationalIdNo,
                addressLine,
                province,
                district,
                ward,
                note,
            };

            return { payload, errors: errs, source: r };
        });

        setValidated(next);
        info('Đã đọc file', `Tổng ${next.length} dòng, hợp lệ ${next.filter(x => x.errors.length === 0).length}`);
    };

    const handleDownloadTemplate = () => {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet([VI_HEADERS]);
        XLSX.utils.book_append_sheet(wb, ws, 'Template');
        XLSX.writeFile(wb, 'Mau_Import_Hoc_Vien.xlsx');
    };

    const handleImport = async () => {
        const items = validated
            .filter(v => v.errors.length === 0 && v.payload)
            .map(v => v.payload!) ;
        if (items.length === 0) {
            error('Không có dòng hợp lệ để import');
            return;
        }

        setImporting(true);
        setProgress(0);

        let ok = 0;
        let fail = 0;
        for (let i = 0; i < items.length; i++) {
            try {
                await createStudent(items[i]);
                ok++;
            } catch (e) {
                fail++;
            }
            setProgress(Math.round(((i + 1) / items.length) * 100));
        }

        setImporting(false);
        success('Import hoàn tất', `Thành công ${ok}, lỗi ${fail}`);
        onSuccess();
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50">
            <div className="fixed inset-0 bg-black/50" onClick={onClose} />
            <div className="fixed inset-0 flex items-start justify-center pt-12 px-4">
                <div className="bg-white rounded-xl shadow-lg w-full max-w-5xl relative flex flex-col max-h-[85vh] overflow-auto">
                    <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Import Học viên từ Excel</h2>
                            <p className="text-sm text-[#717182] mt-1">Tải mẫu, điền dữ liệu và import để tạo nhiều hồ sơ cùng lúc.</p>
                        </div>
                        <button className="text-gray-400 hover:text-gray-600" onClick={onClose}>
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="p-6 space-y-6">
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={handleDownloadTemplate}
                                className="inline-flex items-center gap-2 px-3 py-2 text-sm border rounded-lg hover:bg-gray-50"
                            >
                                <Download className="w-4 h-4" />
                                Tải mẫu Excel
                            </button>

                            <label className="inline-flex items-center gap-2 px-3 py-2 text-sm border rounded-lg cursor-pointer hover:bg-gray-50">
                                <Upload className="w-4 h-4" />
                                {file ? file.name : 'Chọn file Excel (.xlsx/.csv)'}
                                <input
                                    type="file"
                                    accept=".xlsx,.xls,.csv"
                                    hidden
                                    onChange={(e) => {
                                        const f = e.target.files?.[0];
                                        if (f) handlePick(f);
                                    }}
                                />
                            </label>

                            {rows.length > 0 && (
                                <span className="text-sm text-gray-500">
                                    Đã đọc {rows.length} dòng
                                </span>
                            )}
                        </div>

                        {validated.length > 0 && (
                            <div className="flex items-center justify-between">
                                <div className="text-sm">
                                    Tổng: <b>{stats.total}</b> • Hợp lệ: <b className="text-green-700">{stats.valid}</b> • Lỗi: <b className="text-red-700">{stats.invalid}</b>
                                </div>
                                {importing && (
                                    <div className="flex items-center gap-3">
                                        <div className="w-48 h-2 bg-gray-100 rounded">
                                            <div
                                                className="h-2 bg-blue-600 rounded"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                        <div className="text-sm text-gray-600">{progress}%</div>
                                    </div>
                                )}
                            </div>
                        )}

                        {validated.length > 0 && (
                            <div className="border rounded-lg overflow-hidden">
                                <div className="max-h-[38vh] overflow-auto">
                                    <table className="min-w-full text-sm">
                                        <thead className="bg-gray-50 sticky top-0">
                                            <tr>
                                                {VI_HEADERS.map(h => (
                                                    <th key={h} className="text-left px-3 py-2 border-b">{h}</th>
                                                ))}
                                                <th className="text-left px-3 py-2 border-b">Trạng thái</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {validated.map((r, idx) => (
                                                <tr key={idx} className="border-b align-top">
                                                    {VI_HEADERS.map(h => (
                                                        <td key={h} className="px-3 py-2">
                                                            {String(r.source[h] ?? '')}
                                                        </td>
                                                    ))}
                                                    <td className="px-3 py-2">
                                                        {r.errors.length === 0 ? (
                                                            <span className="text-green-700">Hợp lệ</span>
                                                        ) : (
                                                            <div className="text-red-600 flex items-start gap-1">
                                                                <AlertTriangle className="w-4 h-4 mt-0.5" />
                                                                <div>
                                                                    {r.errors.map((e, i) => (
                                                                        <div key={i}>• {e}</div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-6 border-t border-gray-200 mt-auto flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={importing}
                            className="px-6 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                        >
                            Đóng
                        </button>
                        <button
                            type="button"
                            onClick={handleImport}
                            disabled={importing || stats.valid === 0}
                            className="px-6 py-2 text-sm font-medium text-white bg-[#030213] rounded-lg hover:bg-black disabled:opacity-50"
                        >
                            {importing ? 'Đang import...' : `Import ${stats.valid} dòng hợp lệ`}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}


