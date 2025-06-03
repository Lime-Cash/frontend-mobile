import { useState } from "react";

interface UseConfirmationModalProps {
  onConfirm: () => void;
  onCancel?: () => void;
}

export function useConfirmationModal({
  onConfirm,
  onCancel,
}: UseConfirmationModalProps) {
  const [visible, setVisible] = useState(false);

  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);

  const handleConfirm = () => {
    onConfirm();
    hideModal();
  };

  const handleCancel = () => {
    onCancel?.();
    hideModal();
  };

  return {
    visible,
    showModal,
    hideModal,
    handleConfirm,
    handleCancel,
  };
}
