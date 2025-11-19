import React from "react";
import ActionButton from "../ActionButton/ActionButton";
import pencil from "../../assets/Pencil.png";
import trash from "../../assets/Bin.png";

const TableActions = ({ row, onEdit, onDelete, disabled = false }) => {
  return (
    <div className="flex space-x-2">
      <ActionButton
        icon={pencil}
        action={() => onEdit(row)}
        disabled={disabled}
      />
      <ActionButton
        icon={trash}
        action={onDelete}
        disabled={disabled}
        className="bg-red-500 hover:bg-red-600"
      />
    </div>
  );
};
export default TableActions;
