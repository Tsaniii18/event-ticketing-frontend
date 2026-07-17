import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import ReportChart from "../../components/events/ReportChart";
import Button from "../../components/common/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/common/Table";
import {
  CHART_COLORS,
  formatCurrencyOrZero as formatRupiah,
} from "../../utils";
import {
  CalendarDays,
  MapPin,
  Download,
  Ticket,
  Users,
  DollarSign,
  Heart,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  FileText,
  ArrowLeft,
  RefreshCw
} from "lucide-react";
import { eventAPI } from "../../services";
import { motion as Motion } from "framer-motion";
import useLoading from "../../hooks/useLoading";
import LoadingState from "../../components/common/LoadingState";

export default function LaporanEventPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [reportData, setReportData] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const {
    isLoading: loading,
    startLoading,
    stopLoading,
  } = useLoading(true);
  const [error, setError] = useState(null);

  const fetchEventReport = useCallback(async () => {
    try {
      startLoading();
      const response = await eventAPI.getEventReport(eventId);

      if (response.data.report && response.data.metrics) {
        setReportData(response.data.report);
        setMetrics(response.data.metrics);
      } else {
        setReportData(response.data);
        setMetrics({
          total_attendant: response.data.total_checkins || 0,
          total_tickets_sold: response.data.total_tickets_sold || 0,
          total_sales: response.data.total_income || 0,
          total_quota: response.data.total_quota || 0,
          sold_percentage: "0%",
          attendance_rate: "0%"
        });
      }
    } catch (err) {
      console.error("Error fetching event report:", err);
      setError("Gagal memuat laporan event");
    } finally {
      stopLoading();
    }
  }, [eventId, startLoading, stopLoading]);

  useEffect(() => {
    fetchEventReport();
  }, [fetchEventReport]);

  const handleDownloadReport = async () => {
    try {
      const response = await eventAPI.downloadEventReport(eventId);
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `laporan-event-${eventId}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading report:", err);
      alert("Gagal mengunduh laporan");
    }
  };

  const totalQuota = metrics?.total_quota || reportData?.total_quota || 0;
  const totalSold = reportData?.total_tickets_sold || 0;
  const totalCheckins = reportData?.total_checkins || 0;
  const totalIncome = reportData?.total_income || 0;

  return (
    <div className="ui-page">
      <Navbar />

      <div className="py-4 sm:py-8 px-3 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto mt-28 sm:mt-32">
          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="ui-panel p-4 sm:p-6 md:p-8"
          >
            {loading ? (
              <LoadingState
                variant="compact"
                className="py-16 sm:py-20"
                label="Memuat laporan event..."
                description="Mengolah penjualan, check-in, dan pendapatan event"
              />
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-16 sm:py-20">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-100 flex items-center justify-center mb-4">
                  <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-red-500" />
                </div>
                <p className="text-lg sm:text-xl text-gray-800 font-semibold mb-2">Terjadi Kesalahan</p>
                <p className="text-gray-600 mb-6 text-sm sm:text-base">{error}</p>
                <Button
                  onClick={() => navigate(-1)}
                  variant="muted"
                  className="sm:px-6 sm:text-base"
                >
                  <ArrowLeft size={16} />
                  Kembali
                </Button>
              </div>
            ) : !reportData ? (
              <div className="flex flex-col items-center justify-center py-16 sm:py-20">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                </div>
                <p className="text-lg sm:text-xl text-gray-800 font-semibold mb-2">Data Tidak Ditemukan</p>
                <p className="text-gray-600 mb-6 text-sm sm:text-base">Laporan untuk event ini tidak tersedia</p>
                <Button
                  onClick={() => navigate(-1)}
                  variant="muted"
                  className="sm:px-6 sm:text-base"
                >
                  <ArrowLeft size={16} />
                  Kembali
                </Button>
              </div>
            ) : (
              <>
                <Motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="flex flex-col gap-4 mb-6 sm:mb-8"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
                        <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-brand-600" />
                        Laporan Event
                      </h1>
                      <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
                        Analisis dan statistik event Anda
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
                      <Button
                        onClick={fetchEventReport}
                        size="sm"
                        loading={loading}
                        loadingLabel="Refresh"
                        className="sm:min-h-10 sm:px-4 sm:text-base"
                      >
                        <RefreshCw size={16} className="sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Refresh</span>
                      </Button>

                      <Button
                        onClick={() => navigate(-1)}
                        variant="muted"
                        size="sm"
                        className="sm:min-h-10 sm:px-4 sm:text-base"
                      >
                        <ArrowLeft size={16} className="sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Kembali</span>
                      </Button>
                    </div>
                  </div>
                </Motion.div>

                <Motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="bg-linear-to-r from-brand-50 to-brand-100 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 border border-brand-100"
                >
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-3">
                    {reportData.event?.name || 'N/A'}
                  </h2>
                  <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600">
                    <span className="flex items-center gap-1.5 sm:gap-2 bg-white px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg">
                      <CalendarDays className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-600"/>
                      {reportData.event?.date_start
                        ? new Date(reportData.event.date_start).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                        : 'N/A'}
                    </span>
                    <span className="flex items-center gap-1.5 sm:gap-2 bg-white px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg">
                      <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500"/>
                      {reportData.event?.venue || '-'}, {reportData.event?.location || '-'}
                    </span>
                  </div>
                </Motion.div>

                <Motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8"
                >
                  <div className="bg-gray-50 rounded-xl p-4 sm:p-5 border border-gray-200">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <div className="p-1.5 sm:p-2 bg-brand-100 rounded-lg">
                        <Ticket className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-600" />
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-gray-600">Tiket Terjual</span>
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-800">{totalSold}</p>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">dari {totalQuota} kuota</p>
                    <div className="mt-2 h-1.5 sm:h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-500 rounded-full transition-all"
                        style={{ width: `${totalQuota > 0 ? Math.min((totalSold / totalQuota) * 100, 100) : 0}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 sm:p-5 border border-gray-200">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg">
                        <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600" />
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-gray-600">Check-in</span>
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-800">{totalCheckins}</p>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">dari {totalSold} tiket</p>
                    <div className="mt-2 h-1.5 sm:h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full transition-all"
                        style={{ width: `${totalSold > 0 ? Math.min((totalCheckins / totalSold) * 100, 100) : 0}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 sm:p-5 border border-gray-200">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <div className="p-1.5 sm:p-2 bg-purple-100 rounded-lg">
                        <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600" />
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-gray-600">Pendapatan</span>
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-gray-800">{formatRupiah(totalIncome)}</p>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">total penjualan</p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 sm:p-5 border border-gray-200">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <div className="p-1.5 sm:p-2 bg-orange-100 rounded-lg">
                        <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-600" />
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-gray-600">Kehadiran</span>
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-800">{metrics?.attendance_rate || "0%"}</p>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">tingkat kehadiran</p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 sm:p-5 border border-gray-200">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <div className="p-1.5 sm:p-2 bg-pink-100 rounded-lg">
                        <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-pink-600" />
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-gray-600">Likes</span>
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-800">{reportData.total_likes || 0}</p>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">total likes</p>
                  </div>
                </Motion.div>

                <Motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="ui-subtle-panel mb-6 p-4 sm:mb-8 sm:p-6"
                >
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">
                    Detail Penjualan per Kategori Tiket
                  </h3>

                  <Table className="min-w-180">
                        <TableHeader>
                          <TableRow header>
                            <TableHead>Kategori</TableHead>
                            <TableHead align="center">Harga</TableHead>
                            <TableHead align="center">Kuota</TableHead>
                            <TableHead align="center">Terjual</TableHead>
                            <TableHead align="center">Check-in</TableHead>
                            <TableHead align="right">Pendapatan</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(!reportData.purchase_data || reportData.purchase_data.length === 0) ? (
                            <TableRow>
                              <TableCell colSpan="6" align="center" className="py-10 text-gray-500 sm:py-12">
                                <Ticket className="w-8 h-8 sm:w-10 sm:h-10 text-gray-300 mx-auto mb-3" />
                                <p className="text-sm sm:text-base">Tidak ada kategori tiket</p>
                              </TableCell>
                            </TableRow>
                          ) : (
                            reportData.purchase_data.map((item, index) => {
                              const checkin = reportData.checkin_data?.find(c => c.name === item.name) || { value: 0 };
                              const quota = item.quota || 0;
                              const price = item.price || 0;
                              const sold = item.value || 0;
                              const checkinCount = checkin.value || 0;
                              const income = sold * price;
                              const soldPercent = quota > 0 ? ((sold / quota) * 100).toFixed(0) : 0;
                              const checkinPercent = sold > 0 ? ((checkinCount / sold) * 100).toFixed(0) : 0;

                              return (
                                <TableRow key={`row-${index}`}>
                                  <TableCell>
                                    <div className="flex items-center gap-2 sm:gap-3">
                                      <div
                                        className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full shrink-0"
                                        style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                                      />
                                      <span className="font-medium text-gray-800 text-xs sm:text-sm">{item.name}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell align="center">{formatRupiah(price)}</TableCell>
                                  <TableCell align="center">{quota}</TableCell>
                                  <TableCell align="center">
                                    <div className="flex flex-col items-center">
                                      <span className="font-semibold text-brand-600 text-xs sm:text-sm">{sold}</span>
                                      <div className="flex items-center gap-1 sm:gap-2 mt-1">
                                        <div className="w-12 sm:w-20 h-1 sm:h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                          <div
                                            className="h-full bg-brand-500 rounded-full"
                                            style={{ width: `${Math.min(Number(soldPercent), 100)}%` }}
                                          />
                                        </div>
                                        <span className="text-[10px] sm:text-xs text-gray-500">{soldPercent}%</span>
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell align="center">
                                    <div className="flex flex-col items-center">
                                      <span className="font-semibold text-green-600 text-xs sm:text-sm">{checkinCount}</span>
                                      <div className="flex items-center gap-1 sm:gap-2 mt-1">
                                        <div className="w-12 sm:w-20 h-1 sm:h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                          <div
                                            className="h-full bg-green-500 rounded-full"
                                            style={{ width: `${Math.min(Number(checkinPercent), 100)}%` }}
                                          />
                                        </div>
                                        <span className="text-[10px] sm:text-xs text-gray-500">{checkinPercent}%</span>
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell align="right" className="font-semibold text-purple-600">
                                    {formatRupiah(income)}
                                  </TableCell>
                                </TableRow>
                              );
                            })
                          )}
                        </TableBody>
                        {reportData.purchase_data && reportData.purchase_data.length > 0 && (
                          <TableFooter>
                            <TableRow>
                              <TableCell className="text-gray-900">Total</TableCell>
                              <TableCell align="center" className="text-gray-500">-</TableCell>
                              <TableCell align="center" className="text-gray-900">{totalQuota}</TableCell>
                              <TableCell align="center" className="text-brand-600">{totalSold}</TableCell>
                              <TableCell align="center" className="text-success-600">{totalCheckins}</TableCell>
                              <TableCell align="right" className="text-purple-600">{formatRupiah(totalIncome)}</TableCell>
                            </TableRow>
                          </TableFooter>
                        )}
                  </Table>
                </Motion.div>

                <Motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8"
                >
                  <ReportChart
                    data={reportData.purchase_data || []}
                    title="Distribusi Penjualan Tiket"
                    subtitle="Persentase tiket terjual per kategori"
                    type="purchase"
                    icon={Ticket}
                    emptyMessage="Belum ada tiket yang terjual"
                  />

                  <ReportChart
                    data={reportData.checkin_data || []}
                    title="Distribusi Check-in"
                    subtitle="Persentase kehadiran per kategori"
                    type="checkin"
                    icon={Users}
                    emptyMessage="Belum ada pengunjung check-in"
                  />
                </Motion.div>

                <Motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="flex justify-center"
                >
                  <Button
                    onClick={handleDownloadReport}
                    size="lg"
                    className="shadow-lg hover:shadow-xl sm:px-8"
                  >
                    <Download size={18} className="sm:w-5 sm:h-5" />
                    Unduh Laporan (CSV)
                  </Button>
                </Motion.div>
              </>
            )}
          </Motion.div>
        </div>
      </div>
    </div>
  );
}
