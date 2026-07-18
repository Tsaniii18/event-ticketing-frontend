import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import { Calendar, Folder, Plus, Pencil, Trash2, Eye, Save, ArrowLeft } from "lucide-react";
import { eventAPI } from "../../services";
import TicketCategoryModal from "../../components/events/TicketCategoryModal";
import NotificationModal from "../../components/common/NotificationModal";
import ImagePreviewModal from "../../components/common/ImagePreviewModal";
import {
  DescriptionWithNewlines,
  VenueDropdown,
} from "../../components/events/EventFormFields";
import useNotification from "../../hooks/useNotification";
import useImagePreview from "../../hooks/useImagePreview";
import { motion as Motion } from "framer-motion";
import {
  adjustTicketToEventRange,
  buildEventFormData,
  canEditEvent,
  EVENT_PARENT_CATEGORIES,
  createObjectPreviewUrl,
  decodeTokenPayload,
  EDIT_EVENT_VENUES as YOGYAKARTA_VENUES,
  EDIT_EVENT_STATUS_STYLES,
  EXTENDED_DISTRICTS as DISTRICTS,
  formatCurrency,
  formatDateInputValue,
  formatDateForDisplay,
  getFileDisplayName,
  getChildEventCategories,
  getEventAccessFlags,
  getMinimumEventDate,
  hasItemByKey,
  getTicketsOutsideEventRange,
  isCustomVenueName,
  PAGE_CONTAINER_VARIANTS as containerVariants,
  PAGE_ITEM_VARIANTS as itemVariants,
  removeItemByKey,
  readStoredToken,
  replaceItemByKey,
  validateImageFile,
  validateTicketDateRange,
  transformEditableTicketCategories,
} from "../../utils";
import Button from "../../components/common/Button";
import { ROUTES, routeTo } from "../../utils/constants/routeConstants";
import useLoading from "../../hooks/useLoading";
import LoadingState from "../../components/common/LoadingState";

export default function EditEventPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { notification, showNotification, hideNotification } = useNotification();
  const {
    previewData: previewImage,
    isPreviewOpen,
    openImagePreview,
    closeImagePreview,
  } = useImagePreview();

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    child_category: "",
    date_start: "",
    date_end: "",
    location: "",
    venue: "",
    district: "",
    description: "",
    rules: "",
  });

  const [previousEventDates, setPreviousEventDates] = useState({
    date_start: "",
    date_end: ""
  });

  const [posterFile, setPosterFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [currentPoster, setCurrentPoster] = useState("");
  const [currentBanner, setCurrentBanner] = useState("");
  const [ticketList, setTicketList] = useState([]);
  const {
    isLoading: loading,
    startLoading,
    stopLoading,
  } = useLoading(false);
  const [event, setEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [isCustomVenue, setIsCustomVenue] = useState(false);
  const [minDate, setMinDate] = useState("");

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        startLoading();
        const response = await eventAPI.getEvent(eventId);
        const eventData = response.data;

        const token = readStoredToken();
        if (token) {
          const payload = decodeTokenPayload(token);
          if (!payload) throw new Error("Invalid session token");
          const { isOwner: isEventOwner } = getEventAccessFlags(
            payload,
            eventData.owner_id,
          );

          if (!isEventOwner) {
            showNotification("Anda tidak memiliki akses untuk mengedit event ini", "Error", "error");
            navigate(routeTo.eventDetail(eventId));
            return;
          }

          if (!canEditEvent(eventData.status)) {
            showNotification("Event hanya dapat diedit ketika status pending atau rejected", "Error", "error");
            navigate(routeTo.eventDetail(eventId));
            return;
          }
        }

        setEvent(eventData);

        setMinDate(getMinimumEventDate(eventData.created_at));

        const isVenueCustom = isCustomVenueName(
          YOGYAKARTA_VENUES,
          eventData.venue,
        );
        setIsCustomVenue(isVenueCustom);

        const dateStartFormatted = formatDateInputValue(eventData.date_start);
        const dateEndFormatted = formatDateInputValue(eventData.date_end);

        setFormData({
          name: eventData.name,
          category: eventData.category,
          child_category: eventData.child_category || "",
          date_start: dateStartFormatted,
          date_end: dateEndFormatted,
          location: eventData.location,
          venue: eventData.venue || "",
          district: eventData.district || "",
          description: eventData.description,
          rules: eventData.rules || "",
        });

        setPreviousEventDates({
          date_start: dateStartFormatted,
          date_end: dateEndFormatted
        });

        setCurrentPoster(eventData.image || "");
        setCurrentBanner(eventData.flyer || "");

        setTicketList(
          transformEditableTicketCategories(eventData.ticket_categories),
        );

      } catch (error) {
        console.error("Error fetching event data:", error);
        showNotification("Gagal memuat data event", "Error", "error");
        navigate(ROUTES.MY_EVENTS);
      } finally {
        stopLoading();
      }
    };

    if (eventId) {
      fetchEventData();
    }
  }, [eventId, navigate, showNotification, startLoading, stopLoading]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "category" && { child_category: "" })
    }));

    if (name === "date_start" && formData.date_end && value > formData.date_end) {
      setFormData(prev => ({
        ...prev,
        date_end: value
      }));
    }
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    const oldValue = formData[name];

    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "date_start" && prev.date_end && value > prev.date_end && { date_end: value })
    }));

    if (ticketList.length > 0 && oldValue !== value) {
      showNotification(
        "Tanggal event telah diubah. Tanggal tiket akan otomatis disesuaikan saat Anda mengedit tiket.",
        "Info",
        "info"
      );
    }
  };

  const handleVenueChange = (e) => {
    handleInputChange(e);
  };

  const handleCustomVenueToggle = (custom) => {
    setIsCustomVenue(custom);
    if (custom) {
      setFormData(prev => ({
        ...prev,
        venue: "",
        district: "",
        location: ""
      }));
    }
  };

  const handleTextareaChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const validation = validateImageFile(file, { allowedTypes: null });

      if (validation.reason === "size") {
        showNotification(
          `Ukuran file ${type} terlalu besar! Maksimal 5MB.`,
          "Peringatan",
          "warning"
        );
        e.target.value = "";
        return;
      }

      if (validation.reason === "type") {
        showNotification(
          `File ${type} harus berupa gambar!`,
          "Peringatan",
          "warning"
        );
        e.target.value = "";
        return;
      }

      type === "poster" ? setPosterFile(file) : setBannerFile(file);
      showNotification(
        `File ${type} berhasil dipilih!`,
        "Sukses",
        "success"
      );
    }
  };

  const handlePreviewImage = (type) => {
    let imageUrl;
    if (type === 'poster') {
      imageUrl = posterFile
        ? createObjectPreviewUrl(posterFile)
        : currentPoster;
    } else {
      imageUrl = bannerFile
        ? createObjectPreviewUrl(bannerFile)
        : currentBanner;
    }

    if (imageUrl) {
      openImagePreview({
        image: imageUrl,
        type,
      });
    }
  };

  const handleAddTicket = (ticket) => {
    const validation = validateTicketDateRange({
      eventEnd: formData.date_end,
      eventStart: formData.date_start,
      ticketEnd: ticket.date_end,
      ticketStart: ticket.date_start,
    });
    if (!validation.isValid) {
      showNotification(validation.message, "Validasi Gagal", "warning");
      return;
    }

    setTicketList((prev) => [...prev, ticket]);
    showNotification("Kategori tiket berhasil ditambahkan", "Sukses", "success");
  };

  const handleUpdateTicket = (updatedTicket) => {
    const validation = validateTicketDateRange({
      eventEnd: formData.date_end,
      eventStart: formData.date_start,
      ticketEnd: updatedTicket.date_end,
      ticketStart: updatedTicket.date_start,
    });
    if (!validation.isValid) {
      showNotification(validation.message, "Validasi Gagal", "warning");
      return;
    }

    setTicketList((tickets) => replaceItemByKey(tickets, updatedTicket));
    setEditingTicket(null);
    showNotification("Kategori tiket berhasil diperbarui", "Sukses", "success");
  };

  const handleEditTicket = (ticket) => {
    if (!formData.date_start || !formData.date_end) {
      showNotification(
        "Harap tentukan tanggal event terlebih dahulu sebelum mengedit kategori tiket",
        "Validasi Gagal",
        "warning"
      );
      return;
    }

    const adjustedTicket = adjustTicketToEventRange(
      ticket,
      previousEventDates,
      formData,
    );

    setEditingTicket(adjustedTicket);
    setIsModalOpen(true);
  };

  const removeTicketCategory = (id) => {
    setTicketList((tickets) => removeItemByKey(tickets, id));
    showNotification("Kategori tiket berhasil dihapus", "Sukses", "success");
  };

  const handleAddTicketClick = () => {
    if (!formData.date_start || !formData.date_end) {
      showNotification(
        "Harap tentukan tanggal event terlebih dahulu sebelum menambahkan kategori tiket",
        "Validasi Gagal",
        "warning"
      );
      return;
    }

    setEditingTicket(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTicket(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    startLoading();

    if (minDate && formData.date_start < minDate) {
      showNotification(
        `Tanggal mulai event harus minimal 7 hari setelah event dibuat. Paling cepat ${formatDateForDisplay(minDate)}`,
        "Validasi Gagal",
        "warning"
      );
      stopLoading();
      return;
    }

    if (ticketList.length === 0) {
      showNotification("Harap tambahkan minimal satu kategori tiket!", "Peringatan", "warning");
      stopLoading();
      return;
    }

    const invalidTickets = getTicketsOutsideEventRange(
      ticketList,
      formData.date_start,
      formData.date_end,
    );

    if (invalidTickets.length > 0) {
      showNotification(
        `Ada ${invalidTickets.length} kategori tiket dengan tanggal yang tidak sesuai dengan rentang event. Harap edit tiket tersebut terlebih dahulu.`,
        "Validasi Gagal",
        "warning"
      );
      stopLoading();
      return;
    }

    try {
      const submitData = buildEventFormData({
        bannerFile,
        formData,
        posterFile,
        tickets: ticketList,
      });

      const response = await eventAPI.updateEvent(eventId, submitData);

      if (response.data) {
        showNotification("Event berhasil diperbarui!", "Sukses", "success");
        setTimeout(() => navigate(routeTo.eventDetail(eventId)), 2000);
      }
    } catch (error) {
      console.error("Error updating event:", error);
      showNotification(
        `Gagal memperbarui event: ${error.response?.data?.error || error.message}`,
        "Error",
        "error"
      );
    } finally {
      stopLoading();
    }
  };

  const childCategories = getChildEventCategories(formData.category);

  const ticketsNeedingAdjustment =
    formData.date_start && formData.date_end
      ? getTicketsOutsideEventRange(
          ticketList,
          formData.date_start,
          formData.date_end,
        )
      : [];
  const eventStatusStyle = EDIT_EVENT_STATUS_STYLES[event?.status] || {
    bg: "bg-gray-100",
    text: "text-gray-800",
  };

  if (loading && !event) {
    return (
      <div>
        <Navbar />
        <LoadingState
          variant="plain"
          className="min-h-screen"
          label="Memuat data event..."
          description="Menyiapkan informasi event dan kategori tiket"
        />
      </div>
    );
  }

  return (
    <div>
      <Navbar />

      <NotificationModal
        isOpen={notification.isOpen}
        onClose={hideNotification}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />

      <ImagePreviewModal
        isOpen={isPreviewOpen}
        onClose={closeImagePreview}
        imageSrc={previewImage?.image}
        imageAlt={previewImage?.type === 'poster' ? 'Preview Poster' : 'Preview Banner'}
        aspectRatio={previewImage?.type === 'poster' ? 'square' : 'banner'}
      />

      <TicketCategoryModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onAddTicket={handleAddTicket}
        onUpdateTicket={handleUpdateTicket}
        editingTicket={editingTicket}
        eventDates={{ start: formData.date_start, end: formData.date_end }}
        minDate={minDate}
      />

      <div className="ui-page">
        <div className="ui-container">
          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="ui-panel mt-32 p-6 md:p-8"
          >
            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8"
            >
              <div className="flex items-center gap-4">
                <Button unstyled
                  onClick={() => navigate(routeTo.eventDetail(eventId))}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors p-2 rounded-lg hover:bg-gray-100"
                  whileHover={{ scale: 1.05, x: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ArrowLeft size={20} />
                  <span className="font-medium">Kembali</span>
                </Button>
                <div>
                  <h1 className="ui-heading-1">Edit Event</h1>
                  <p className="text-gray-600 mt-2">Perbarui informasi event Anda</p>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-4 md:mt-0">
                {event && (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-700 font-medium">Status:</span>
                    <span
                      className={`ui-badge ${eventStatusStyle.bg} ${eventStatusStyle.text}`}
                    >
                      {event.status === 'pending' ? 'Pending' :
                       event.status === 'rejected' ? 'Ditolak' :
                       event.status === 'approved' ? 'Disetujui' :
                       event.status === 'published' ? 'Dipublikasi' : event.status}
                    </span>
                  </div>
                )}
              </div>
            </Motion.div>

            <Motion.form
              onSubmit={handleSubmit}
              className="space-y-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <Motion.div variants={itemVariants} className="ui-subtle-panel p-6">
                <h2 className="ui-heading-2 mb-6">Informasi Dasar Event</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="ui-label">Nama Event *</label>
                    <input
                      type="text"
                      name="name"
                      className="ui-input"
                      placeholder="Masukkan nama event"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="ui-label">Kategori Event *</label>
                    <select
                      name="category"
                      className="ui-input"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Pilih kategori</option>
                      {EVENT_PARENT_CATEGORIES.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  {formData.category && childCategories.length > 0 && (
                    <div className="space-y-2">
                      <label className="ui-label">Sub-Kategori Event</label>
                      <select
                        name="child_category"
                        className="ui-input"
                        value={formData.child_category}
                        onChange={handleInputChange}
                      >
                        <option value="">Pilih sub-kategori (opsional)</option>
                        {childCategories.map((childCategory) => (
                          <option key={childCategory} value={childCategory}>
                            {childCategory}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </Motion.div>

              <Motion.div variants={itemVariants} className="ui-subtle-panel p-6">
                <h2 className="ui-heading-2 mb-6">Tanggal & Waktu Event</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="ui-label">Tanggal Mulai *</label>
                    <div className="ui-input-group">
                      <Calendar className="text-brand-500 mr-3" size={20} />
                      <input
                        type="date"
                        name="date_start"
                        className="w-full outline-none bg-transparent"
                        value={formData.date_start}
                        onChange={handleDateChange}
                        min={minDate}
                        required
                      />
                    </div>
                    {minDate && (
                      <p className="text-xs text-gray-500">
                        Minimal tanggal: {formatDateForDisplay(minDate)}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="ui-label">Tanggal Selesai *</label>
                    <div className="ui-input-group">
                      <Calendar className="text-brand-500 mr-3" size={20} />
                      <input
                        type="date"
                        name="date_end"
                        className="w-full outline-none bg-transparent"
                        value={formData.date_end}
                        onChange={handleDateChange}
                        min={formData.date_start || minDate}
                        required
                      />
                    </div>
                  </div>
                </div>

                {ticketsNeedingAdjustment.length > 0 && (
                  <div className="mt-4 ui-alert ui-alert-warning">
                    <p className="text-sm text-yellow-800">
                      <strong>Perhatian:</strong> Ada {ticketsNeedingAdjustment.length} kategori tiket yang tanggalnya
                      berada di luar rentang tanggal event baru. Harap edit tiket-tiket tersebut untuk menyesuaikan tanggalnya:
                    </p>
                    <ul className="mt-2 list-disc list-inside text-sm text-yellow-700">
                      {ticketsNeedingAdjustment.map(ticket => (
                        <li key={ticket.id}>{ticket.name}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </Motion.div>

              <Motion.div variants={itemVariants} className="ui-subtle-panel p-6">
                <h2 className="ui-heading-2 mb-6">Media Event</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="ui-label">Poster Event</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-brand-400 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, "poster")}
                        className="hidden"
                        id="poster-upload"
                      />
                      <label htmlFor="poster-upload" className="cursor-pointer block text-center">
                        <div className="text-gray-500 mb-2">
                          <Folder className="mx-auto" size={32} />
                        </div>
                        <span className="text-sm text-gray-600">
                          {getFileDisplayName(posterFile, {
                            currentFile: currentPoster,
                            currentLabel: "Poster saat ini",
                          })}
                        </span>
                        <p className="text-xs text-gray-400 mt-1">Klik untuk mengganti poster</p>
                      </label>
                    </div>
                    {(posterFile || currentPoster) && (
                      <Button unstyled
                        type="button"
                        onClick={() => handlePreviewImage('poster')}
                        className="flex items-center gap-2 text-brand-600 hover:text-brand-800 text-sm"
                      >
                        <Eye size={16} />
                        Lihat Preview
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="ui-label">Banner Event</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-brand-400 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, "banner")}
                        className="hidden"
                        id="banner-upload"
                      />
                      <label htmlFor="banner-upload" className="cursor-pointer block text-center">
                        <div className="text-gray-500 mb-2">
                          <Folder className="mx-auto" size={32} />
                        </div>
                        <span className="text-sm text-gray-600">
                          {getFileDisplayName(bannerFile, {
                            currentFile: currentBanner,
                            currentLabel: "Banner saat ini",
                          })}
                        </span>
                        <p className="text-xs text-gray-400 mt-1">Klik untuk mengganti banner</p>
                      </label>
                    </div>
                    {(bannerFile || currentBanner) && (
                      <Button unstyled
                        type="button"
                        onClick={() => handlePreviewImage('banner')}
                        className="flex items-center gap-2 text-brand-600 hover:text-brand-800 text-sm"
                      >
                        <Eye size={16} />
                        Lihat Preview
                      </Button>
                    )}
                  </div>
                </div>
              </Motion.div>

              <Motion.div variants={itemVariants} className="ui-subtle-panel p-6">
                <h2 className="ui-heading-2 mb-6">Lokasi Event</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <label className="ui-label">Nama Venue *</label>
                    <VenueDropdown
                      value={formData.venue}
                      venues={YOGYAKARTA_VENUES}
                      onChange={handleVenueChange}
                      onCustomVenueToggle={handleCustomVenueToggle}
                      isCustomVenue={isCustomVenue}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="ui-label">Kecamatan *</label>
                    <select
                      name="district"
                      className="ui-input"
                      value={formData.district}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Pilih kecamatan</option>
                      {DISTRICTS.map((district) => (
                        <option key={district} value={district}>
                          {district}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="ui-label">Alamat Lengkap *</label>
                    <input
                      type="text"
                      name="location"
                      className="ui-input"
                      placeholder="Masukkan alamat lengkap venue"
                      value={formData.location}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </Motion.div>

              <Motion.div variants={itemVariants} className="ui-subtle-panel p-6">
                <h2 className="ui-heading-2 mb-6">Informasi Tambahan</h2>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="ui-label">Deskripsi Event *</label>
                    <textarea
                      rows={4}
                      name="description"
                      className="ui-textarea"
                      placeholder="Jelaskan detail event Anda (tekan Enter untuk baris baru)"
                      value={formData.description}
                      onChange={handleTextareaChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="ui-label">Peraturan Event</label>
                    <textarea
                      rows={4}
                      name="rules"
                      className="ui-textarea"
                      placeholder="Masukkan peraturan event (tekan Enter untuk baris baru)"
                      value={formData.rules}
                      onChange={handleTextareaChange}
                    />
                  </div>
                </div>
              </Motion.div>

              <Motion.div variants={itemVariants} className="ui-subtle-panel p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="ui-heading-2">Kategori Tiket</h2>
                  <Button
                    type="button"
                    onClick={handleAddTicketClick}
                    variant="primary" className="px-5"
                    whileHover={{ scale: 1.05, y: -1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Plus size={20} />
                    Tambah Kategori Tiket
                  </Button>
                </div>

                <div className="space-y-4">
                  {ticketList.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-xl">
                      <Folder className="mx-auto text-gray-400 mb-3" size={48} />
                      <p className="text-gray-500 font-medium">Belum ada kategori tiket</p>
                      <p className="text-gray-400 text-sm mt-1">Klik tombol di atas untuk menambahkan kategori tiket pertama</p>
                    </div>
                  ) : (
                    ticketList.map((t) => {
                      const needsAdjustment = hasItemByKey(
                        ticketsNeedingAdjustment,
                        t.id,
                      );

                      return (
                        <Motion.div
                          key={t.id}
                          className={`ui-card p-5 transition-shadow hover:shadow-md ${
                            needsAdjustment ? 'border-warning-200 bg-warning-50' : ''
                          }`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold text-lg text-gray-900">{t.name}</h3>
                                <span className="ui-badge ui-badge-info px-2 py-1">
                                  {formatCurrency(Number(t.price))}
                                </span>
                                {needsAdjustment && (
                                  <span className="ui-badge ui-badge-warning px-2 py-1">
                                    Perlu Disesuaikan
                                  </span>
                                )}
                              </div>
                              {t.description && (
                                <DescriptionWithNewlines text={t.description} />
                              )}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500">
                                <div>
                                  <span className="font-medium">Kuota:</span> {t.quota} tiket
                                </div>
                                <div>
                                  <span className="font-medium">Mulai:</span> {t.date_start} {t.time_start}
                                </div>
                                <div>
                                  <span className="font-medium">Selesai:</span> {t.date_end} {t.time_end}
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 sm:ml-4">
                              <Button
                                type="button"
                                onClick={() => handleEditTicket(t)}
                                variant="custom"
                                className={`px-3 py-2 ${
                                  needsAdjustment
                                    ? 'bg-warning-100 text-warning-700 hover:bg-warning-200'
                                    : 'bg-brand-50 text-brand-700 hover:bg-brand-100'
                                }`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Pencil size={16} />
                                {needsAdjustment ? 'Sesuaikan' : 'Edit'}
                              </Button>
                              <Button
                                type="button"
                                onClick={() => removeTicketCategory(t.id)}
                                variant="soft" tone="danger" className="bg-danger-50 px-3 py-2 text-danger-700 hover:bg-danger-100"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Trash2 size={16} />
                                Hapus
                              </Button>
                            </div>
                          </div>
                        </Motion.div>
                      );
                    })
                  )}
                </div>
              </Motion.div>

              <Motion.div
                variants={itemVariants}
                className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200"
              >
                <Button
                  type="button"
                  onClick={() => navigate(ROUTES.MY_EVENTS)}
                  variant="secondary" className="flex-1 px-6 py-3"
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={loading || ticketsNeedingAdjustment.length > 0}
                  loading={loading}
                  loadingLabel="Menyimpan Perubahan..."
                  variant="primary"
                  className="flex-1 px-6 py-3"
                  whileHover={{ scale: loading ? 1 : 1.02, y: loading ? 0 : -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Save size={20} />
                  {ticketsNeedingAdjustment.length > 0 ? (
                    "Sesuaikan Tanggal Tiket Terlebih Dahulu"
                  ) : (
                    "Simpan & Ajukan Kembali"
                  )}
                </Button>
              </Motion.div>
            </Motion.form>
          </Motion.div>
        </div>
      </div>
    </div>
  );
}
