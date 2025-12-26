import { useEffect, useRef } from "react";
import IDELayout from "@/components/ide/IDELayout";
import { useIDEStore } from "@/lib/ide-store";

export default function IDEPage() {
  const { initializeFromStorage, bootContainer, saveToStorage, files, apiKeys, aiModel } = useIDEStore();
  const hasInitialized = useRef(false);

  // Initialize from IndexedDB on mount
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      initializeFromStorage().then(() => {
        // Boot WebContainer after loading state
        bootContainer();
      });
    }
  }, [initializeFromStorage, bootContainer]);

  // Auto-save to IndexedDB when state changes (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveToStorage();
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [files, apiKeys, aiModel, saveToStorage]);

  return <IDELayout />;
}
