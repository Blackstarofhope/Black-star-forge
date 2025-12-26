import * as Y from "yjs";
import { WebrtcProvider } from "y-webrtc";

let ydoc: Y.Doc | null = null;
let provider: WebrtcProvider | null = null;

interface CollaborationState {
  isConnected: boolean;
  peers: string[];
  sessionId: string | null;
}

let state: CollaborationState = {
  isConnected: false,
  peers: [],
  sessionId: null,
};

type StateChangeCallback = (state: CollaborationState) => void;
const stateChangeCallbacks: StateChangeCallback[] = [];

export function onStateChange(callback: StateChangeCallback): () => void {
  stateChangeCallbacks.push(callback);
  return () => {
    const index = stateChangeCallbacks.indexOf(callback);
    if (index > -1) {
      stateChangeCallbacks.splice(index, 1);
    }
  };
}

function notifyStateChange(): void {
  stateChangeCallbacks.forEach((cb) => cb(state));
}

export function initCollaboration(sessionId: string): Y.Doc {
  if (ydoc && state.sessionId === sessionId) {
    return ydoc;
  }

  // Clean up existing connection
  destroyCollaboration();

  // Create new Yjs document
  ydoc = new Y.Doc();

  // Create WebRTC provider for peer-to-peer sync
  provider = new WebrtcProvider(`blackstar-forge-${sessionId}`, ydoc, {
    signaling: ["wss://signaling.yjs.dev"],
  });

  state = {
    isConnected: true,
    peers: [],
    sessionId,
  };

  // Track awareness (connected peers)
  provider.awareness.on("change", () => {
    const peers: string[] = [];
    provider?.awareness.getStates().forEach((state, clientId) => {
      if (clientId !== ydoc?.clientID && state.user) {
        peers.push(state.user.name || `User ${clientId}`);
      }
    });
    state.peers = peers;
    notifyStateChange();
  });

  // Set local user info
  provider.awareness.setLocalStateField("user", {
    name: `User ${Math.floor(Math.random() * 1000)}`,
    color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
  });

  notifyStateChange();
  return ydoc;
}

export function getYDoc(): Y.Doc | null {
  return ydoc;
}

export function getYText(name: string): Y.Text | null {
  return ydoc?.getText(name) || null;
}

export function getYMap<T>(name: string): Y.Map<T> | null {
  return ydoc?.getMap(name) || null;
}

export function getCollaborationState(): CollaborationState {
  return { ...state };
}

export function destroyCollaboration(): void {
  if (provider) {
    provider.destroy();
    provider = null;
  }

  if (ydoc) {
    ydoc.destroy();
    ydoc = null;
  }

  state = {
    isConnected: false,
    peers: [],
    sessionId: null,
  };

  notifyStateChange();
}

// Bind Yjs to Monaco editor (for real-time collaborative editing)
export function bindMonacoToYjs(
  editor: any,
  ytext: Y.Text,
  awareness: any
): () => void {
  // This is a simplified binding - in production, use y-monaco
  let isRemoteChange = false;

  const yObserver = () => {
    if (!isRemoteChange) {
      isRemoteChange = true;
      const content = ytext.toString();
      const currentContent = editor.getValue();
      if (content !== currentContent) {
        const position = editor.getPosition();
        editor.setValue(content);
        if (position) {
          editor.setPosition(position);
        }
      }
      isRemoteChange = false;
    }
  };

  ytext.observe(yObserver);

  const editorObserver = editor.onDidChangeModelContent((event: any) => {
    if (!isRemoteChange) {
      isRemoteChange = true;
      const newContent = editor.getValue();
      ydoc?.transact(() => {
        ytext.delete(0, ytext.length);
        ytext.insert(0, newContent);
      });
      isRemoteChange = false;
    }
  });

  return () => {
    ytext.unobserve(yObserver);
    editorObserver.dispose();
  };
}
