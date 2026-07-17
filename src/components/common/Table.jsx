import { motion as Motion } from "framer-motion";

const ALIGNMENT_CLASSES = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

const joinClasses = (...classes) => classes.filter(Boolean).join(" ");

export function Table({
  children,
  className = "",
  containerClassName = "",
}) {
  return (
    <div className={joinClasses("ui-table-shell", containerClassName)}>
      <table className={joinClasses("ui-table", className)}>{children}</table>
    </div>
  );
}

export function TableHeader({ children, className = "" }) {
  return (
    <thead className={joinClasses("ui-table-header", className)}>
      {children}
    </thead>
  );
}

export function TableBody({ children, className = "" }) {
  return (
    <tbody className={joinClasses("ui-table-body", className)}>
      {children}
    </tbody>
  );
}

export function TableFooter({ children, className = "" }) {
  return (
    <tfoot className={joinClasses("ui-table-footer", className)}>
      {children}
    </tfoot>
  );
}

export function TableRow({
  animated = false,
  children,
  className = "",
  header = false,
  ...props
}) {
  const Row = animated ? Motion.tr : "tr";
  return (
    <Row
      className={joinClasses(header ? "" : "ui-table-row", className)}
      {...props}
    >
      {children}
    </Row>
  );
}

export function TableHead({
  align = "left",
  children,
  className = "",
  ...props
}) {
  return (
    <th
      scope="col"
      className={joinClasses(
        "ui-table-head",
        ALIGNMENT_CLASSES[align],
        className,
      )}
      {...props}
    >
      {children}
    </th>
  );
}

export function TableCell({
  align = "left",
  children,
  className = "",
  ...props
}) {
  return (
    <td
      className={joinClasses(
        "ui-table-cell",
        ALIGNMENT_CLASSES[align],
        className,
      )}
      {...props}
    >
      {children}
    </td>
  );
}
