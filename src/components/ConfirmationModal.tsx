import React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
} from "@mui/material";

interface ConfirmationModalProps {
  open: boolean;
  title: string;
  content: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  open,
  title,
  content,
  onConfirm,
  onCancel,
}) => {
  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>{content}</DialogContent>
      <DialogActions>
        <Button onClick={onCancel} color="secondary">
          Cancel
        </Button>
        <Button onClick={onConfirm} color="primary" autoFocus>
          Yes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationModal;
