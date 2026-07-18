export const getEventCheckInRestriction = (
  event,
  currentDate = new Date(),
) => {
  const eventStart = event?.date_start ? new Date(event.date_start) : null;
  const eventEnd = event?.date_end ? new Date(event.date_end) : null;

  if (eventStart && currentDate < eventStart) {
    return {
      errorMessage:
        "Event belum dimulai. Tiket ini belum bisa digunakan untuk check-in.",
      notification: {
        message: "Tiket belum bisa digunakan, event belum dimulai",
        title: "Belum Jadwalnya",
        type: "warning",
      },
      status: "not_started",
    };
  }

  if (eventEnd && currentDate > eventEnd) {
    return {
      errorMessage:
        "Waktu event sudah berakhir. Tiket ini sudah tidak berlaku.",
      notification: {
        message: "Tiket sudah kadaluarsa",
        title: "Tiket Kadaluarsa",
        type: "error",
      },
      status: "expired",
    };
  }

  return null;
};

const getCheckInStatusFromMessage = (message) => {
  if (
    message.includes("not started") ||
    message.includes("belum dimulai") ||
    message.includes("belum jadwal")
  ) {
    return "not_started";
  }
  if (
    message.includes("expired") ||
    message.includes("kadaluarsa") ||
    message.includes("berakhir") ||
    message.includes("ended")
  ) {
    return "expired";
  }
  if (
    message.includes("already used") ||
    message.includes("sudah digunakan")
  ) {
    return "already_used";
  }
  if (
    message.includes("not found") ||
    message.includes("tidak ditemukan") ||
    message.includes("invalid")
  ) {
    return "invalid";
  }
  if (message.includes("not active")) return "inactive_message";
  return "error";
};

export const getCheckInErrorDetails = (error) => {
  const responseData = error.response?.data || {};
  const originalMessage =
    responseData.error || "Terjadi kesalahan saat check-in";
  const backendStatus = responseData.status || null;
  const resolvedStatus = [
    "not_started",
    "expired",
    "already_used",
    "cancelled",
    "inactive",
  ].includes(backendStatus)
    ? backendStatus
    : getCheckInStatusFromMessage(originalMessage);

  const details = {
    already_used: {
      notification: {
        message: "Tiket sudah pernah digunakan",
        title: "Check-in Gagal",
        type: "warning",
      },
      status: "already_used",
    },
    cancelled: {
      errorMessage: "Tiket telah dibatalkan dan tidak dapat digunakan.",
      notification: {
        message: "Tiket dibatalkan",
        title: "Check-in Gagal",
        type: "error",
      },
      status: "error",
    },
    error: {
      notification: {
        message: originalMessage,
        title: "Check-in Gagal",
        type: "error",
      },
      status: "error",
    },
    expired: {
      notification: {
        message: "Tiket sudah kadaluarsa",
        title: "Tiket Kadaluarsa",
        type: "error",
      },
      status: "expired",
    },
    inactive: {
      errorMessage: "Tiket tidak aktif dan tidak dapat digunakan.",
      notification: {
        message: "Tiket tidak aktif",
        title: "Check-in Gagal",
        type: "error",
      },
      status: "error",
    },
    inactive_message: {
      notification: {
        message: "Tiket tidak aktif",
        title: "Check-in Gagal",
        type: "error",
      },
      status: "error",
    },
    invalid: {
      notification: {
        message: "Tiket tidak ditemukan atau tidak valid",
        title: "Check-in Gagal",
        type: "error",
      },
      status: "error",
    },
    not_started: {
      notification: {
        message: "Tiket belum bisa digunakan, event belum dimulai",
        title: "Belum Jadwalnya",
        type: "warning",
      },
      status: "not_started",
    },
  }[resolvedStatus];

  return {
    errorMessage: details.errorMessage || originalMessage,
    notification: details.notification,
    status: details.status,
    ticket: responseData.ticket || null,
    usedAt: responseData.used_at || null,
  };
};
