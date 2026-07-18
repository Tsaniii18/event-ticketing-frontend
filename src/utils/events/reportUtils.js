import { calculatePercentage } from "../shared/numberUtils";

export const normalizeEventReport = (responseData) => {
  if (responseData.report && responseData.metrics) {
    return {
      metrics: responseData.metrics,
      report: responseData.report,
    };
  }

  return {
    metrics: {
      attendance_rate: "0%",
      sold_percentage: "0%",
      total_attendant: responseData.total_checkins || 0,
      total_quota: responseData.total_quota || 0,
      total_sales: responseData.total_income || 0,
      total_tickets_sold: responseData.total_tickets_sold || 0,
    },
    report: responseData,
  };
};

export const getTicketReportRows = (purchaseData = [], checkinData = []) =>
  purchaseData.map((item) => {
    const checkin =
      checkinData.find((checkinItem) => checkinItem.name === item.name)
        ?.value || 0;
    const price = item.price || 0;
    const quota = item.quota || 0;
    const sold = item.value || 0;

    return {
      checkin,
      checkinPercent:
        calculatePercentage(checkin, sold, { precision: 0 }),
      income: sold * price,
      name: item.name,
      price,
      quota,
      sold,
      soldPercent: calculatePercentage(sold, quota, { precision: 0 }),
    };
  });
