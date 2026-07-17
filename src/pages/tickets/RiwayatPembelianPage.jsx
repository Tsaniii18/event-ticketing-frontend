import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import NotificationModal from "../../components/common/NotificationModal";
import useNotification from "../../hooks/useNotification";
import { transactionAPI } from "../../services";
import {
  Clock,
  MapPin,
  DollarSign,
  ExternalLink,
  ChevronDown,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  X,
  Search,
  RefreshCw,
  Ticket,
  Receipt,
  Timer,
  Ban,
  ArrowUpDown,
  Sparkles,
  CalendarDays
} from "lucide-react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  formatCurrency,
  formatRawDateRange as formatDateRange,
  formatTimeRange,
  getTransactionStatusLabel as getStatusLabel,
  groupTicketsByCategory,
  TRANSACTION_STATUS_CONFIG as STATUS_CONFIG,
} from "../../utils";
import Button from "../../components/common/Button";
import { ROUTES } from "../../utils/routeConstants";

export default function RiwayatTransaksi() {
  const navigate = useNavigate();
  const { notification, showNotification, hideNotification } = useNotification();

  const [expandedTransactions, setExpandedTransactions] = useState({});
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await transactionAPI.getTransactionHistory();

      if (response.data && response.data.transactions) {
        const transformedTransactions = response.data.transactions.map(transaction => ({
          transactionId: transaction.transaction_id,
          transactionDate: new Date(transaction.transaction_time).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          }),
          transactionTime: transaction.transaction_time,
          transactionDateTime: new Date(transaction.transaction_time),
          totalAmount: transaction.price_total,
          status: transaction.transaction_status,
          statusLabel: getStatusLabel(transaction.transaction_status),
          linkPayment: transaction.link_payment,
          events: transaction.events?.map(event => ({
            id: event.event_id,
            eventName: event.event_name,
            address: event.location,
            city: event.city,
            venue: event.venue,
            startDate: new Date(event.date_start).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            }),
            endDate: new Date(event.date_end).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            }),
            image: event.image,
            eventSubtotal: event.event_subtotal,
            details: groupTicketsByCategory(event.ticket_details)
          })) || []
        }));

        setTransactions(transformedTransactions);
      } else {
        setTransactions([]);
      }
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError(err.response?.data?.error || "Gagal mengambil data transaksi");
      showNotification("Gagal mengambil data transaksi", "Error", "error");
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const statusStats = useMemo(() => {
    const stats = {
      all: transactions.length,
      paid: 0,
      pending: 0,
      failed: 0,
      expired: 0,
      cancelled: 0
    };

    transactions.forEach(t => {
      if (stats[t.status] !== undefined) {
        stats[t.status]++;
      }
    });

    return stats;
  }, [transactions]);

  const totalSpent = useMemo(() => {
    return transactions
      .filter(t => t.status === 'paid')
      .reduce((sum, t) => sum + t.totalAmount, 0);
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    if (selectedStatus !== "all") {
      filtered = filtered.filter(t => t.status === selectedStatus);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(t =>
        t.transactionId.toLowerCase().includes(term) ||
        t.events.some(e => e.eventName.toLowerCase().includes(term))
      );
    }

    filtered.sort((a, b) => {
      let compareResult = 0;
      switch (sortBy) {
        case "date":
          compareResult = a.transactionDateTime - b.transactionDateTime;
          break;
        case "amount":
          compareResult = a.totalAmount - b.totalAmount;
          break;
        case "status":
          compareResult = a.status.localeCompare(b.status);
          break;
        default:
          compareResult = a.transactionDateTime - b.transactionDateTime;
      }
      return sortOrder === "desc" ? -compareResult : compareResult;
    });

    return filtered;
  }, [transactions, selectedStatus, searchTerm, sortBy, sortOrder]);

  const toggleTransactionDropdown = (transactionId) => {
    setExpandedTransactions(prev => ({
      ...prev,
      [transactionId]: !prev[transactionId]
    }));
  };

  const handleShowDetail = (transaction, event, detail) => {
    setSelectedTicket({ transaction, event, detail });
    setShowDetailDialog(true);
  };

  const handleCloseDetail = () => {
    setShowDetailDialog(false);
    setSelectedTicket(null);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedStatus("all");
    showNotification("Filter berhasil direset", "Info", "info");
  };

  const hasActiveFilters = searchTerm || selectedStatus !== "all";

  const StatusBadge = ({ status, size = "sm" }) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    const Icon = config.icon;

    const sizeClasses = {
      sm: "px-2 py-0.5 text-xs",
      md: "px-3 py-1.5 text-sm"
    };

    return (
      <span className={`
        inline-flex items-center gap-1 font-medium rounded-full
        ${config.bgColor} ${config.textColor} ${config.borderColor} border
        ${sizeClasses[size]}
      `}>
        <Icon size={size === "sm" ? 12 : 14} />
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="ui-page mt-15">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="ui-spinner mx-auto size-16"
            />
            <p className="mt-6 text-gray-600 font-medium">Memuat riwayat transaksi...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ui-page mt-15">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh] p-4">
          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="ui-feedback-panel ui-error-state"
          >
            <div className="ui-feedback-icon bg-danger-100">
              <XCircle className="w-8 h-8 text-danger-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Terjadi Kesalahan</h3>
            <p className="text-gray-600 mb-6 text-sm">{error}</p>
            <Button
              onClick={fetchTransactions}
              variant="primary" className="w-full rounded-xl py-3"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <RefreshCw size={16} className="inline mr-2" />
              Coba Lagi
            </Button>
          </Motion.div>
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="ui-page mt-15">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh] p-4">
          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="ui-feedback-panel ui-empty-state"
          >
            <div className="ui-feedback-icon size-20 bg-gray-100">
              <Receipt className="w-10 h-10 text-gray-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Belum Ada Transaksi</h3>
            <p className="text-gray-600 mb-6 text-sm">Anda belum memiliki riwayat pembelian tiket</p>
            <Button
              onClick={() => navigate(ROUTES.EVENT_SEARCH)}
              variant="primary" className="w-full rounded-xl py-3"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Sparkles size={16} className="inline mr-2" />
              Jelajahi Event
            </Button>
          </Motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="ui-page mt-15">
      <Navbar />

      <NotificationModal
        isOpen={notification.isOpen}
        onClose={hideNotification}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />

      <div className="pt-20 pb-8 md:pt-24 md:pb-12">
        <div className="ui-container px-3">
          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="ui-panel p-4 sm:p-6 md:p-8"
          >

            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3"
            >
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                  Riwayat Pembelian
                </h1>
                <p className="text-gray-600 text-sm mt-1 hidden sm:block">
                  Semua transaksi pembelian tiket Anda
                </p>
              </div>

              <Button
                onClick={fetchTransactions}
                variant="primary" className="px-3 py-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </Motion.div>

            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 mb-6"
            >
              <div className="flex gap-2 mb-4 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
                {[
                  { key: "all", label: "Semua", count: statusStats.all },
                  { key: "paid", label: "Berhasil", count: statusStats.paid },
                  { key: "pending", label: "Menunggu", count: statusStats.pending },
                  { key: "failed", label: "Gagal", count: statusStats.failed },
                  { key: "expired", label: "Kadaluarsa", count: statusStats.expired }
                ].filter(tab => tab.key === "all" || tab.count > 0).map((tab) => (
                  <Button unstyled
                    key={tab.key}
                    onClick={() => setSelectedStatus(tab.key)}
                    className={`
                      flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap shrink-0
                      ${selectedStatus === tab.key
                        ? 'bg-brand-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }
                    `}
                    whileTap={{ scale: 0.98 }}
                  >
                    {tab.key !== "all" && STATUS_CONFIG[tab.key] && (
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        selectedStatus === tab.key ? 'bg-white' : STATUS_CONFIG[tab.key].dotColor
                      }`} />
                    )}
                    {tab.label}
                    <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                      selectedStatus === tab.key ? 'bg-white/20' : 'bg-gray-300'
                    }`}>
                      {tab.count}
                    </span>
                  </Button>
                ))}
              </div>

              <div className="flex flex-col gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Cari transaksi atau event..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="ui-input py-2.5 pl-9 pr-9 text-sm"
                  />
                  {searchTerm && (
                    <Button unstyled
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X size={16} />
                    </Button>
                  )}
                </div>

                <div className="flex gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="ui-select flex-1 px-3 py-2.5 text-sm"
                  >
                    <option value="date">Tanggal</option>
                    <option value="amount">Jumlah</option>
                    <option value="status">Status</option>
                  </select>

                  <Button
                    onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                    variant="muted" className="px-3"
                    whileTap={{ scale: 0.95 }}
                  >
                    <ArrowUpDown size={18} className={`text-gray-600 ${sortOrder === "desc" ? "rotate-180" : ""}`} />
                  </Button>
                </div>
              </div>

              {hasActiveFilters && (
                <Motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-gray-200"
                >
                  <span className="text-xs text-gray-500">Filter:</span>
                  {selectedStatus !== "all" && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-brand-100 text-brand-700 rounded-full text-xs">
                      {STATUS_CONFIG[selectedStatus]?.label}
                      <Button unstyled onClick={() => setSelectedStatus("all")}><X size={12} /></Button>
                    </span>
                  )}
                  {searchTerm && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs">
                      "{searchTerm.length > 10 ? searchTerm.slice(0, 10) + '...' : searchTerm}"
                      <Button unstyled onClick={() => setSearchTerm("")}><X size={12} /></Button>
                    </span>
                  )}
                  <Button unstyled onClick={clearFilters} className="text-xs text-red-600 hover:text-red-700 font-medium ml-auto">
                    Reset
                  </Button>
                </Motion.div>
              )}
            </Motion.div>

            <Motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4"
            >
              <p className="text-gray-600 text-sm">
                <span className="font-semibold text-gray-800">{filteredTransactions.length}</span> transaksi
              </p>
              <p className="text-sm font-semibold text-gray-900">
                Total: <span className="text-brand-600">{formatCurrency(totalSpent)}</span>
              </p>
            </Motion.div>

            <div className="space-y-3">
              {filteredTransactions.length === 0 ? (
                <Motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-8 text-center"
                >
                  <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Tidak Ada Transaksi</h3>
                  <p className="text-gray-600 text-sm mb-4">Tidak ada transaksi yang sesuai dengan filter</p>
                  <Button
                    onClick={clearFilters}
                    variant="primary" className="py-2"
                    whileTap={{ scale: 0.98 }}
                  >
                    Reset Filter
                  </Button>
                </Motion.div>
              ) : (
                filteredTransactions.map((transaction, index) => (
                  <Motion.div
                    key={transaction.transactionId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                  >
                    <div
                      onClick={() => toggleTransactionDropdown(transaction.transactionId)}
                      className="p-3 sm:p-4 md:p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="hidden sm:flex w-12 h-12 md:w-16 md:h-16 bg-brand-100 rounded-lg items-center justify-center shrink-0">
                            <Receipt size={20} className="text-brand-600 md:w-6 md:h-6" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-start gap-2 mb-2">
                              <h3 className="text-sm sm:text-base font-bold text-gray-900">
                                #{transaction.transactionId.slice(-8).toUpperCase()}
                              </h3>
                              <StatusBadge status={transaction.status} size="sm" />
                            </div>

                            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs sm:text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <CalendarDays size={12} className="text-brand-600" />
                                <span>{transaction.transactionDate}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <DollarSign size={12} className="text-emerald-600" />
                                <span className="font-medium">{formatCurrency(transaction.totalAmount)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Ticket size={12} className="text-amber-600" />
                                <span>{transaction.events.length} event</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <Motion.div
                          className="flex items-center justify-center w-8 h-8 bg-brand-600 text-white rounded-lg shrink-0"
                          animate={{ rotate: expandedTransactions[transaction.transactionId] ? 180 : 0 }}
                        >
                          <ChevronDown size={16} />
                        </Motion.div>
                      </div>
                    </div>

                    <AnimatePresence>
                      {expandedTransactions[transaction.transactionId] && (
                        <Motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="border-t border-gray-200 bg-gray-50/50 overflow-hidden"
                        >
                          <div className="p-3 sm:p-4 md:p-6 space-y-4">
                            {transaction.status === 'pending' && transaction.linkPayment && (
                              <div className="ui-alert ui-alert-warning flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
                                <div className="flex items-start gap-2 flex-1">
                                  <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                                  <div>
                                    <p className="text-amber-700 font-medium text-sm">Menunggu Pembayaran</p>
                                    <p className="text-amber-600 text-xs">Selesaikan sebelum waktu habis</p>
                                  </div>
                                </div>
                                <Button
                                  as={Motion.a}
                                  href={transaction.linkPayment}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  variant="warning"
                                  className="py-2"
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <ExternalLink size={14} />
                                  Bayar
                                </Button>
                              </div>
                            )}

                            <div>
                              <h4 className="font-semibold text-gray-800 flex items-center gap-2 mb-3 text-sm">
                                <Info size={16} />
                                Detail Event ({transaction.events.length})
                              </h4>

                              <div className="space-y-3">
                                {transaction.events.map((event, eventIndex) => (
                                  <Motion.div
                                    key={event.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: eventIndex * 0.05 }}
                                    className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4"
                                  >
                                    <div className="flex items-start gap-3 mb-3">
                                      {event.image && (
                                        <img
                                          src={event.image}
                                          alt={event.eventName}
                                          className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg object-cover shadow-sm shrink-0"
                                        />
                                      )}
                                      <div className="flex-1 min-w-0">
                                        <h5 className="font-bold text-gray-900 text-sm sm:text-base mb-1 line-clamp-2">{event.eventName}</h5>
                                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-600">
                                          <div className="flex items-center gap-1">
                                            <MapPin size={11} className="text-brand-600" />
                                            <span className="truncate max-w-30 sm:max-w-none">{event.venue || event.address}</span>
                                          </div>
                                          <div className="flex items-center gap-1">
                                            <CalendarDays size={11} className="text-purple-600" />
                                            <span>{formatDateRange(event.startDate, event.endDate)}</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="pt-3 border-t border-gray-200 space-y-2">
                                      {event.details.map((detail, detailIndex) => (
                                        <div key={detailIndex} className="bg-gray-50 rounded-lg p-2.5 sm:p-3">
                                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                                            <div className="flex-1">
                                              <h6 className="font-semibold text-gray-800 text-sm">{detail.type}</h6>
                                              <div className="flex flex-wrap gap-2 text-xs text-gray-600 mt-1">
                                                <div className="flex items-center gap-1">
                                                  <CalendarDays size={10} className="text-brand-600" />
                                                  <span>{formatDateRange(detail.startDate, detail.endDate)}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                  <Clock size={10} className="text-purple-600" />
                                                  <span>{formatTimeRange(detail.dateTimeStart, detail.dateTimeEnd)}</span>
                                                </div>
                                              </div>
                                            </div>

                                            {detail.tickets && detail.tickets.length > 0 && (
                                              <Button unstyled
                                                onClick={() => handleShowDetail(transaction, event, detail)}
                                                className="flex items-center gap-1 px-2.5 py-1.5 bg-brand-600 text-white rounded text-xs font-medium hover:bg-brand-700 self-start"
                                                whileTap={{ scale: 0.95 }}
                                              >
                                                <Info size={11} />
                                                Detail
                                              </Button>
                                            )}
                                          </div>

                                          <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                                            <span className="text-xs text-gray-600">
                                              {detail.quantity}x {formatCurrency(detail.price)}
                                            </span>
                                            <span className="font-bold text-gray-900 text-sm">
                                              {formatCurrency(detail.price * detail.quantity)}
                                            </span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </Motion.div>
                                ))}
                              </div>
                            </div>

                            <div className="bg-brand-50 border border-brand-200 rounded-lg p-3">
                              <div className="flex justify-between items-center">
                                <span className="text-brand-800 font-semibold text-sm">Total Transaksi:</span>
                                <span className="text-brand-800 font-bold text-base sm:text-lg">
                                  {formatCurrency(transaction.totalAmount)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Motion.div>
                      )}
                    </AnimatePresence>
                  </Motion.div>
                ))
              )}
            </div>
          </Motion.div>
        </div>
      </div>

      <AnimatePresence>
        {showDetailDialog && selectedTicket && (
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="ui-modal-backdrop bg-black/60 backdrop-blur-sm"
            onClick={handleCloseDetail}
          >
            <Motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="ui-modal-panel sm:max-w-md overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 sm:p-6 bg-white border-b border-gray-200">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-2">{selectedTicket.event.eventName}</h3>
                    <p className="text-gray-600 text-sm mt-1">{selectedTicket.detail.type}</p>
                  </div>
                  <Button unstyled
                    onClick={handleCloseDetail}
                    className="text-gray-500 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition-colors shrink-0"
                    whileTap={{ scale: 0.9 }}
                  >
                    <X size={20} />
                  </Button>
                </div>
              </div>

              <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-gray-50 p-2.5 rounded-lg">
                    <span className="text-gray-500 text-xs block mb-0.5">Transaction ID</span>
                    <span className="font-mono font-semibold text-xs">{selectedTicket.transaction.transactionId.slice(-8).toUpperCase()}</span>
                  </div>
                  <div className="bg-gray-50 p-2.5 rounded-lg">
                    <span className="text-gray-500 text-xs block mb-0.5">Kategori</span>
                    <span className="font-semibold text-xs">{selectedTicket.detail.type}</span>
                  </div>
                  <div className="bg-gray-50 p-2.5 rounded-lg">
                    <span className="text-gray-500 text-xs block mb-0.5">Harga</span>
                    <span className="font-semibold text-xs">{formatCurrency(selectedTicket.detail.price)}</span>
                  </div>
                  <div className="bg-gray-50 p-2.5 rounded-lg">
                    <span className="text-gray-500 text-xs block mb-0.5">Quantity</span>
                    <span className="font-semibold text-xs">{selectedTicket.detail.quantity}</span>
                  </div>
                </div>

                <div className="bg-brand-50 border border-brand-200 rounded-lg p-3 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-brand-800 font-semibold text-sm">Subtotal:</span>
                    <span className="text-brand-800 font-bold">
                      {formatCurrency(selectedTicket.detail.price * selectedTicket.detail.quantity)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600 text-xs">Tanggal Event:</span>
                    <span className="font-semibold text-xs">
                      {formatDateRange(selectedTicket.detail.startDate, selectedTicket.detail.endDate)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600 text-xs">Waktu:</span>
                    <span className="font-semibold text-xs">
                      {formatTimeRange(selectedTicket.detail.dateTimeStart, selectedTicket.detail.dateTimeEnd)}
                    </span>
                  </div>
                  <div className="flex justify-between items-start py-2 border-b border-gray-200">
                    <span className="text-gray-600 text-xs">Venue:</span>
                    <span className="font-semibold text-xs text-right max-w-40">
                      {selectedTicket.event.venue || selectedTicket.event.address}
                    </span>
                  </div>
                </div>

                {selectedTicket.detail.tickets && selectedTicket.detail.tickets.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2 text-sm">
                      <Ticket size={16} />
                      Daftar Tiket ({selectedTicket.detail.tickets.length})
                    </h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {selectedTicket.detail.tickets.map((ticket, idx) => (
                        <div key={idx} className="bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="text-gray-600 text-xs">Tiket #{idx + 1}</span>
                            <span className={`ui-badge px-1.5 py-0.5 ${
                              ticket.status === 'active' ? 'ui-badge-success' :
                              'border-gray-200 bg-gray-100 text-gray-600'
                            }`}>
                              {ticket.status === 'active' ? 'Aktif' :
                               ticket.status === 'used' ? 'Digunakan' : ticket.status}
                            </span>
                          </div>
                          <div className="flex gap-4 text-xs">
                            <div>
                              <span className="text-gray-500">ID:</span>
                              <span className="font-mono ml-1">{ticket.ticketId?.slice(-6)}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Code:</span>
                              <span className="font-mono ml-1 font-medium">{ticket.code}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleCloseDetail}
                  variant="primary" className="w-full py-3"
                  whileTap={{ scale: 0.98 }}
                >
                  Tutup
                </Button>
              </div>
            </Motion.div>
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
