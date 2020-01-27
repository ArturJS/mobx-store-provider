import React, { useContext, useRef, Provider } from "react";

const stores = new Map();

function identity(thing: any): any {
  return thing;
}

interface Store {
  Context: any;
  useStore: Function;
  dispose: Function;
}

/**
 * React Hook used to instantiate a new store from within a component.
 * @param storeFactory Callback used to create and return a store
 * @returns The instance created by the `storeFactory` function
 */
function createStore(storeFactory: Function): any {
  const storeRef = useRef(null);
  if (!storeRef.current) {
    storeRef.current = storeFactory();
  }
  return storeRef.current;
}

/**
 * React Hook to retrieve the store `Provider` component for a given `storeIdentifier`.
 *
 * Use this wrapper to supply your application with a store.
 * @param storeIdentifier The identifier used for the store (optional)
 */
function useProvider(storeIdentifier: any = null): Provider<any> {
  return retrieveStore(storeIdentifier).Context.Provider;
}

/**
 * React Hook which retrieves the `store` from the `Provider` that supplies it.
 * @param storeIdentifier The identifier used for the store (optional)
 */
function useStore(
  storeIdentifier: any = null,
  mapStateToProps: Function = identity,
): any {
  return retrieveStore(storeIdentifier).useStore(mapStateToProps);
}

/**
 * This will dispose the `store` identified by the `storeIdentifier`.
 * @param storeIdentifier The identifier used for the store (optional)
 */
function disposeStore(storeIdentifier: any = null): undefined {
  return retrieveStore(storeIdentifier).dispose();
}

/**
 * Creates and/or retrieves the `store` from the internal `stores` Map.
 * @param storeIdentifier The identifier supplied by the consumer
 */
function retrieveStore(storeIdentifier: any = null): Store {
  if (!stores.has(storeIdentifier)) {
    const Context = React.createContext(null);
    Context.displayName = String(storeIdentifier);
    stores.set(storeIdentifier, {
      Context,
      useStore: (mapStateToProps: Function = identity): any => {
        const store = useContext(Context);
        return mapStateToProps(store);
      },
      dispose: () => stores.delete(storeIdentifier),
    });
  }
  return stores.get(storeIdentifier);
}

export { createStore, useProvider, useStore, disposeStore };
