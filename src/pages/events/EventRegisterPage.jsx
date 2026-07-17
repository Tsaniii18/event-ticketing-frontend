import Navbar from "../../components/layout/Navbar";
import {
  Calendar,
  Folder,
  Plus,
  Pencil,
  Trash2,
  Eye,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
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
  formatDateForDisplay,
  getMinimumEventDate as getMinDate,
  MAX_IMAGE_SIZE,
  PAGE_CONTAINER_VARIANTS as containerVariants,
  PAGE_ITEM_VARIANTS as itemVariants,
  REGISTRATION_VENUES as YOGYAKARTA_VENUES,
  YOGYAKARTA_DISTRICTS as DISTRICTS,
} from "../../utils";
import Button from "../../components/common/Button";

export default function EventRegister() {
  const navigate = useNavigate();
  const { notification, showNotification, hideNotification } =
    useNotification();
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

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [posterFile, setPosterFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [ticketList, setTicketList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [isCustomVenue, setIsCustomVenue] = useState(false);

  const minDate = getMinDate();

  const fetchEventCategories = useCallback(async () => {
    try {
      setLoadingCategories(true);
      const response = await eventAPI.getEventCategories();
      const categoriesData = response.data.event_category || [];
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error fetching event categories:", error);
      showNotification("Gagal memuat kategori event", "Error", "error");
    } finally {
      setLoadingCategories(false);
    }
  }, [showNotification]);

  useEffect(() => {
    fetchEventCategories();
  }, [fetchEventCategories]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "category" && { child_category: "" }),
    }));

    if (
      name === "date_start" &&
      formData.date_end &&
      value > formData.date_end
    ) {
      setFormData((prev) => ({
        ...prev,
        date_end: value,
      }));
    }
  };

  const handleVenueChange = (e) => {
    handleInputChange(e);
  };

  const handleCustomVenueToggle = (custom) => {
    setIsCustomVenue(custom);
    if (custom) {
      setFormData((prev) => ({
        ...prev,
        venue: "",
        district: "",
        location: "",
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
      if (file.size > MAX_IMAGE_SIZE) {
        showNotification(
          `Ukuran file ${type} terlalu besar! Maksimal 5MB.`,
          "Peringatan",
          "warning"
        );
        e.target.value = "";
        return;
      }

      if (!file.type.startsWith("image/")) {
        showNotification(
          `File ${type} harus berupa gambar!`,
          "Peringatan",
          "warning"
        );
        e.target.value = "";
        return;
      }

      type === "poster" ? setPosterFile(file) : setBannerFile(file);
      showNotification(`File ${type} berhasil dipilih!`, "Sukses", "success");
    }
  };

  const handlePreviewImage = (type) => {
    const file = type === "poster" ? posterFile : bannerFile;
    if (file) {
      openImagePreview({
        image: URL.createObjectURL(file),
        type,
      });
    }
  };

const validateTicketDates = (ticketStart, ticketEnd) => {
  if (!formData.date_start || !formData.date_end) {
    return { isValid: false, message: "Harap tentukan tanggal event terlebih dahulu" };
  }

  const eventStart = new Date(formData.date_start);
  const eventEnd = new Date(formData.date_end);
  const ticketStartDate = new Date(ticketStart);
  const ticketEndDate = new Date(ticketEnd);

  eventStart.setHours(0, 0, 0, 0);
  eventEnd.setHours(23, 59, 59, 999);
  ticketStartDate.setHours(0, 0, 0, 0);
  ticketEndDate.setHours(23, 59, 59, 999);

  if (ticketStartDate < eventStart) {
    return {
      isValid: false,
      message: `Tanggal mulai tiket tidak boleh sebelum tanggal event (${formatDateForDisplay(formData.date_start)})`
    };
  }

  if (ticketEndDate > eventEnd) {
    return {
      isValid: false,
      message: `Tanggal selesai tiket tidak boleh setelah tanggal event (${formatDateForDisplay(formData.date_end)})`
    };
  }

  return { isValid: true };
};

const handleAddTicket = (ticket) => {
  const validation = validateTicketDates(ticket.date_start, ticket.date_end);
  if (!validation.isValid) {
    showNotification(validation.message, "Validasi Gagal", "warning");
    return;
  }

  setTicketList((prev) => [...prev, ticket]);
  showNotification("Kategori tiket berhasil ditambahkan", "Sukses", "success");
};

const handleUpdateTicket = (updatedTicket) => {
  const validation = validateTicketDates(updatedTicket.date_start, updatedTicket.date_end);
  if (!validation.isValid) {
    showNotification(validation.message, "Validasi Gagal", "warning");
    return;
  }

  setTicketList((prev) =>
    prev.map((ticket) =>
      ticket.id === updatedTicket.id ? updatedTicket : ticket
    )
  );
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

  setEditingTicket(ticket);
  setIsModalOpen(true);
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

  const removeTicketCategory = (id) => {
    setTicketList((prev) => prev.filter((ticket) => ticket.id !== id));
    showNotification("Kategori tiket berhasil dihapus", "Sukses", "success");
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = new Date(formData.date_start);
    const minStartDate = new Date();
    minStartDate.setDate(minStartDate.getDate() + 7);
    minStartDate.setHours(0, 0, 0, 0);

    if (startDate < minStartDate) {
      showNotification(
        `Tanggal mulai event harus minimal 7 hari dari sekarang. Paling cepat ${formatDateForDisplay(
          minDate
        )}`,
        "Validasi Gagal",
        "warning"
      );
      setLoading(false);
      return;
    }

    if (ticketList.length === 0) {
      showNotification(
        "Harap tambahkan minimal satu kategori tiket!",
        "Peringatan",
        "warning"
      );
      setLoading(false);
      return;
    }

    try {
      const submitData = new FormData();

      Object.keys(formData).forEach((key) => {
        if (formData[key]) {
          if (key === "date_start" || key === "date_end") {
            const date = new Date(formData[key]);
            submitData.append(key, date.toISOString());
          } else {
            submitData.append(key, formData[key]);
          }
        }
      });

      if (posterFile) submitData.append("image", posterFile);
      if (bannerFile) submitData.append("flyer", bannerFile);

      if (ticketList.length > 0) {
        const ticketCategories = ticketList.map((ticket) => ({
          name: ticket.name,
          price: parseFloat(ticket.price),
          quota: parseInt(ticket.quota),
          description: ticket.description,
          date_time_start: new Date(
            ticket.date_start + "T" + ticket.time_start + ":00Z"
          ).toISOString(),
          date_time_end: new Date(
            ticket.date_end + "T" + ticket.time_end + ":00Z"
          ).toISOString(),
        }));
        submitData.append(
          "ticket_categories",
          JSON.stringify(ticketCategories)
        );
      }

      const response = await eventAPI.createEvent(submitData);

      if (response.data) {
        clearAllData();
        showNotification(
          "Event berhasil dibuat! Menunggu verifikasi admin.",
          "Sukses",
          "success"
        );
        setTimeout(() => navigate("/"), 2000);
      }
    } catch (error) {
      console.error("Error creating event:", error);
      showNotification(
        `Gagal membuat event: ${error.response?.data?.error || error.message}`,
        "Error",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const clearAllData = () => {
    setFormData({
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
    setPosterFile(null);
    setBannerFile(null);
    setTicketList([]);
    setIsCustomVenue(false);
  };

  const getPosterFileName = () => (posterFile ? posterFile.name : "Pilih file");
  const getBannerFileName = () => (bannerFile ? bannerFile.name : "Pilih file");

  const getChildCategories = () => {
    const selectedCategory = categories.find(
      (cat) => cat.event_category_name === formData.category
    );
    return selectedCategory?.child_event_category || [];
  };

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
        imageAlt={previewImage?.type === "poster" ? "Preview Poster" : "Preview Banner"}
        aspectRatio={previewImage?.type === "poster" ? "square" : "banner"}
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
              <div>
                <h1 className="ui-heading-1">
                  Daftarkan Event
                </h1>
                <p className="text-gray-600 mt-2">
                  Isi informasi event Anda dengan lengkap dan benar
                </p>
              </div>
            </Motion.div>

            <Motion.form
              onSubmit={handleSubmit}
              className="space-y-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <Motion.div
                variants={itemVariants}
                className="ui-subtle-panel p-6"
              >
                <h2 className="ui-heading-2 mb-6">
                  Informasi Dasar Event
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="ui-label">
                      Nama Event *
                    </label>
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
                    <label className="ui-label">
                      Kategori Event *
                    </label>
                    <select
                      name="category"
                      className="ui-input"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      disabled={loadingCategories}
                    >
                      <option value="">
                        {loadingCategories
                          ? "Memuat kategori..."
                          : "Pilih kategori event"}
                      </option>
                      {categories.map((category) => (
                        <option
                          key={category.event_category_id}
                          value={category.event_category_name}
                        >
                          {category.event_category_name}
                        </option>
                      ))}
                    </select>
                    {loadingCategories && (
                      <p className="text-xs text-gray-500">
                        Sedang memuat kategori...
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="ui-label">
                      Sub Kategori Event *
                    </label>
                    <select
                      name="child_category"
                      className="ui-input"
                      value={formData.child_category}
                      onChange={handleInputChange}
                      required
                      disabled={!formData.category || loadingCategories}
                    >
                      <option value="">
                        {!formData.category
                          ? "Pilih kategori terlebih dahulu"
                          : "Pilih sub kategori"}
                      </option>
                      {getChildCategories().map((childCategory) => (
                        <option
                          key={childCategory.child_event_category_id}
                          value={childCategory.child_event_category_name}
                        >
                          {childCategory.child_event_category_name}
                        </option>
                      ))}
                    </select>
                    {formData.category && getChildCategories().length === 0 && (
                      <p className="text-xs text-yellow-600">
                        Tidak ada subkategori untuk kategori ini
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="ui-label">
                      Kecamatan *
                    </label>
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
                </div>
              </Motion.div>

              <Motion.div
                variants={itemVariants}
                className="ui-subtle-panel p-6"
              >
                <h2 className="ui-heading-2 mb-6">
                  Media Event
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="ui-label">
                      Poster Event (1:1) *
                    </label>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-3 border-2 border-dashed border-gray-300 rounded-xl p-4 cursor-pointer hover:border-brand-400 transition-colors flex-1">
                        <Folder className="text-brand-500" size={24} />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-700">
                            {getPosterFileName()}
                          </p>
                          <p className="text-xs text-gray-500">
                            Klik untuk memilih file (maks. 5MB)
                          </p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, "poster")}
                        />
                      </label>
                      {posterFile && (
                        <Button unstyled
                          type="button"
                          onClick={() => handlePreviewImage("poster")}
                          className="flex items-center gap-2 bg-brand-50 text-brand-700 px-4 py-3 rounded-lg hover:bg-brand-100 transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Eye size={18} />
                          Preview
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="ui-label">
                      Banner Event (16:6) *
                    </label>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-3 border-2 border-dashed border-gray-300 rounded-xl p-4 cursor-pointer hover:border-brand-400 transition-colors flex-1">
                        <Folder className="text-brand-500" size={24} />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-700">
                            {getBannerFileName()}
                          </p>
                          <p className="text-xs text-gray-500">
                            Klik untuk memilih file (maks. 5MB)
                          </p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, "banner")}
                        />
                      </label>
                      {bannerFile && (
                        <Button unstyled
                          type="button"
                          onClick={() => handlePreviewImage("banner")}
                          className="flex items-center gap-2 bg-brand-50 text-brand-700 px-4 py-3 rounded-lg hover:bg-brand-100 transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Eye size={18} />
                          Preview
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Motion.div>

              <Motion.div
                variants={itemVariants}
                className="ui-subtle-panel p-6"
              >
                <h2 className="ui-heading-2 mb-6">
                  Waktu & Lokasi
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="ui-label">
                      Tanggal Mulai *
                    </label>
                    <div className="ui-input-group">
                      <Calendar className="text-brand-500 mr-3" size={20} />
                      <input
                        type="date"
                        name="date_start"
                        className="w-full outline-none bg-transparent"
                        value={formData.date_start}
                        onChange={handleInputChange}
                        min={minDate}
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-800">
                      Paling cepat 7 hari dari hari ini (
                      {formatDateForDisplay(minDate)})
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="ui-label">
                      Tanggal Selesai *
                    </label>
                    <div className="ui-input-group">
                      <Calendar className="text-brand-500 mr-3" size={20} />
                      <input
                        type="date"
                        name="date_end"
                        className="w-full outline-none bg-transparent"
                        value={formData.date_end}
                        onChange={handleInputChange}
                        min={formData.date_start || minDate}
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-800">
                      Harus setelah tanggal mulai
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="ui-label">
                      Venue *
                    </label>
                    <VenueDropdown
                      value={formData.venue}
                      venues={YOGYAKARTA_VENUES}
                      onChange={handleVenueChange}
                      onCustomVenueToggle={handleCustomVenueToggle}
                      isCustomVenue={isCustomVenue}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="ui-label">
                      Alamat Lengkap *
                    </label>
                    <textarea
                      name="location"
                      rows={3}
                      className="ui-textarea"
                      placeholder="Masukkan alamat lengkap venue"
                      value={formData.location}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </Motion.div>

              <Motion.div
                variants={itemVariants}
                className="ui-subtle-panel p-6"
              >
                <h2 className="ui-heading-2 mb-6">
                  Informasi Tambahan
                </h2>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="ui-label">
                      Deskripsi Event *
                    </label>
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
                    <label className="ui-label">
                      Peraturan Event
                    </label>
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

              <Motion.div
                variants={itemVariants}
                className="ui-subtle-panel p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="ui-heading-2">
                    Kategori Tiket
                  </h2>
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
                      <Folder
                        className="mx-auto text-gray-400 mb-3"
                        size={48}
                      />
                      <p className="text-gray-500 font-medium">
                        Belum ada kategori tiket
                      </p>
                      <p className="text-gray-400 text-sm mt-1">
                        Klik tombol di atas untuk menambahkan kategori tiket
                        pertama
                      </p>
                    </div>
                  ) : (
                    ticketList.map((t) => (
                      <Motion.div
                        key={t.id}
                        className="ui-card p-5 transition-shadow hover:shadow-md"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-lg text-gray-900">
                                {t.name}
                              </h3>
                              <span className="ui-badge ui-badge-info px-2 py-1">
                                Rp {parseFloat(t.price).toLocaleString("id-ID")}
                              </span>
                            </div>
                            {t.description && (
                              <DescriptionWithNewlines text={t.description} />
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500">
                              <div>
                                <span className="font-medium">Kuota:</span>{" "}
                                {t.quota} tiket
                              </div>
                              <div>
                                <span className="font-medium">Mulai:</span>{" "}
                                {t.date_start} {t.time_start}
                              </div>
                              <div>
                                <span className="font-medium">Selesai:</span>{" "}
                                {t.date_end} {t.time_end}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 sm:ml-4">
                            <Button
                              type="button"
                              onClick={() => handleEditTicket(t)}
                              variant="soft" tone="brand" className="bg-brand-50 px-3 py-2 text-brand-700 hover:bg-brand-100"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Pencil size={16} />
                              Edit
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
                    ))
                  )}
                </div>
              </Motion.div>

              <Motion.div
                variants={itemVariants}
                className="flex gap-4 pt-6 border-t border-gray-200"
              >
                <Button
                  type="button"
                  onClick={() => navigate("/")}
                  variant="secondary" className="flex-1 px-6 py-3"
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  variant="primary" className="flex-1 px-6 py-3"
                  whileHover={{
                    scale: loading ? 1 : 1.02,
                    y: loading ? 0 : -1,
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Membuat Event...
                    </div>
                  ) : (
                    "Daftarkan Event"
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
