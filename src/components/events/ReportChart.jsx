import { createElement } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import {
  calculatePercentage,
  CHART_COLORS,
  hasPositiveValue,
  sumBy,
} from "../../utils";

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  outerRadius,
  percent,
  value,
}) => {
  if (percent < 0.05 || value === 0) return null;

  const radian = Math.PI / 180;
  const radius = outerRadius + 20;
  const x = cx + radius * Math.cos(-midAngle * radian);
  const y = cy + radius * Math.sin(-midAngle * radian);

  return (
    <text
      x={x}
      y={y}
      fill="#374151"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize={12}
      fontWeight="600"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

function EmptyStateChart({ message, icon }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 sm:py-12">
      <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        {createElement(icon, {
          className: "w-10 h-10 sm:w-12 sm:h-12 text-gray-300",
        })}
      </div>
      <p className="text-gray-500 font-medium text-sm sm:text-base">
        {message}
      </p>
    </div>
  );
}

function CustomTooltip({ active, payload, type }) {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0];
  return (
    <div className="bg-white px-4 py-3 rounded-lg shadow-lg border border-gray-200">
      <p className="font-semibold text-gray-800">{data.name}</p>
      <p className="text-gray-600">
        {data.value} {type === "purchase" ? "tiket terjual" : "check-in"}
      </p>
    </div>
  );
}

export default function ReportChart({
  data,
  title,
  subtitle,
  type,
  icon: Icon,
  emptyMessage,
}) {
  const totalValue = sumBy(data || [], (entry) => entry.value);

  return (
    <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
      <div className="bg-gray-100 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
        <div className="flex items-center gap-2 sm:gap-3">
          <div
            className={`p-1.5 sm:p-2 rounded-lg ${
              type === "purchase" ? "bg-brand-100" : "bg-green-100"
            }`}
          >
            <Icon
              className={`w-4 h-4 sm:w-5 sm:h-5 ${
                type === "purchase" ? "text-brand-600" : "text-green-600"
              }`}
            />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 text-sm sm:text-base">
              {title}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500">{subtitle}</p>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 bg-white">
        {!hasPositiveValue(data) ? (
          <EmptyStateChart message={emptyMessage} icon={Icon} />
        ) : (
          <div className="flex flex-col lg:flex-row items-center gap-4 sm:gap-6">
            <div className="w-full lg:w-1/2 flex justify-center">
              <div
                style={{
                  width: "100%",
                  maxWidth: "256px",
                  height: "256px",
                  minHeight: "200px",
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={2}
                      label={renderCustomizedLabel}
                      labelLine={{ stroke: "#9CA3AF", strokeWidth: 1 }}
                    >
                      {data.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                          stroke="#fff"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip type={type} />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="w-full lg:w-1/2">
              <div className="space-y-2 sm:space-y-3">
                {data.map((item, index) => {
                  const percentage = calculatePercentage(
                    item.value,
                    totalValue,
                    { precision: 1 },
                  );

                  return (
                    <div
                      key={`legend-${index}`}
                      className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div
                          className="w-3 h-3 sm:w-4 sm:h-4 rounded-full shrink-0"
                          style={{
                            backgroundColor:
                              CHART_COLORS[index % CHART_COLORS.length],
                          }}
                        />
                        <span className="font-medium text-gray-700 text-sm sm:text-base">
                          {item.name}
                        </span>
                      </div>
                      <div className="text-right">
                        <span
                          className={`font-bold text-sm sm:text-base ${
                            type === "purchase"
                              ? "text-brand-600"
                              : "text-green-600"
                          }`}
                        >
                          {item.value}
                        </span>
                        <span className="text-gray-400 text-xs sm:text-sm ml-1 sm:ml-2">
                          ({percentage}%)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
