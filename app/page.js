"use client"
import { useState } from 'react';
import { XCircleIcon, ArrowPathIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

export default function SignalsDashboard() {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [signals, setSignals] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const MIN_START_DATE = '2014-09-08';
    const MAX_END_DATE = '2025-02-18';

    const validateDates = () => {
        if (!startDate || !endDate) {
            setError('Please select both dates');
            return false;
        }

        if (startDate < MIN_START_DATE) {
            setError(`Start date cannot be before ${new Date(MIN_START_DATE).toLocaleDateString()}`);
            return false;
        }

        if (endDate > MAX_END_DATE) {
            setError(`End date cannot be after ${new Date(MAX_END_DATE).toLocaleDateString()}`);
            return false;
        }

        if (startDate > endDate) {
            setError('Start date cannot be greater than end date');
            return false;
        }

        return true;
    };

    const fetchSignals = async () => {
        setError(null);
        if (!validateDates()) return;

        setLoading(true);
        try {
            const response = await fetch(
                `https://forex-signals.foliumaitech.com/signals?start_date=${startDate}&end_date=${endDate}`
            );
            const data = await response.json();
            setSignals(data.results);
        } catch (err) {
            setError('Failed to fetch signals');
        } finally {
            setLoading(false);
        }
    };

    const downloadExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(signals);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Signals');
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(data, `forex-signals-${startDate}-${endDate}.xlsx`);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-800 mb-3">Forex Signals Analyzer</h1>
                    <p className="text-gray-600 flex items-center justify-center gap-2">
                        <InformationCircleIcon className="w-5 h-5 text-blue-500" />
                        <span>Date range allowed: September 8, 2014 - February 18, 2025</span>
                    </p>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">Start Date</label>
                            <input
                                type="date"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={startDate}
                                min={MIN_START_DATE}
                                max={endDate || MAX_END_DATE}
                                onChange={(e) => {
                                    setStartDate(e.target.value);
                                    setError(null);
                                }}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">End Date</label>
                            <input
                                type="date"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={endDate}
                                min={startDate || MIN_START_DATE}
                                max={MAX_END_DATE}
                                onChange={(e) => {
                                    setEndDate(e.target.value);
                                    setError(null);
                                }}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-center gap-3 mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
                            <XCircleIcon className="w-6 h-6 text-red-500" />
                            <span className="text-red-600 font-medium">{error}</span>
                        </div>
                    )}

                    <button
                        onClick={fetchSignals}
                        disabled={loading}
                        className="w-full md:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-200
                                   disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading && <ArrowPathIcon className="w-5 h-5 animate-spin" />}
                        {loading ? 'Fetching Signals...' : 'Get Signals'}
                    </button>
                </div>

                {signals.length > 0 && (
                    <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                            <h2 className="text-2xl font-bold text-gray-800">Analysis Results</h2>
                            <button
                                onClick={downloadExcel}
                                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors
                                           flex items-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1s-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm4 15h-8v-1h8v1zm0-3h-8v-1h8v1zm0-3h-8v-1h8v1z"/>
                                </svg>
                                Export to Excel
                            </button>
                        </div>

                        <div className="overflow-x-auto rounded-lg border border-gray-200 hidden">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                <tr>
                                    {['Date', 'Trend', 'Signal Time', 'Entry Price', 'Stop Price', 'Limit Price', 'Lots', 'Pips', 'Pip Cost'].map((header) => (
                                        <th key={header} className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                {signals.map((signal, index) => (
                                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-700 font-medium">{signal.Date}</td>
                                        <td className="px-6 py-4">
                                            {signal.Trend ? (
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium 
                                                        ${signal.Trend === 'BEARISH' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                                                        {signal.Trend}
                                                    </span>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {signal.SignalTime ? new Date(signal.SignalTime).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            }) : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{signal.EntryPrice?.toFixed(5) || '-'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{signal.StopPrice?.toFixed(5) || '-'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{signal.LimitPrice?.toFixed(5) || '-'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600 text-center">{signal.Lots?.toFixed(2) || '-'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600 text-center">{signal.Pips?.toFixed(2) || '-'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600 text-center">${signal.PipCost?.toFixed(2) || '-'}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}