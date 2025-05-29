// Example usage of ConfirmationModal in other components

import React from "react";
import { View } from "react-native";
import Button from "@/components/ui/Button";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { useConfirmationModal } from "@/hooks/useConfirmationModal";

export default function ExampleUsage() {
  const handleDeleteAction = () => {
    // Perform delete action
    console.log("Item deleted");
  };

  const { visible, showModal, handleConfirm, handleCancel } =
    useConfirmationModal({
      onConfirm: handleDeleteAction,
      onCancel: () => console.log("Delete cancelled"),
    });

  return (
    <View>
      <Button title="Delete Item" onPress={showModal} variant="filled" />

      <ConfirmationModal
        visible={visible}
        title="Delete Item"
        description="Are you sure you want to delete this item? This action cannot be undone."
        button1Content="Cancel"
        button2Content="Delete"
        onButton1Press={handleCancel}
        onButton2Press={handleConfirm}
        button1Style="cancel"
        button2Style="destructive"
      />
    </View>
  );
}
