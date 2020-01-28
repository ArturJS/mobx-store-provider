# mobx-store-provider

React Hooks + [mobx-state-tree](http://mobx-state-tree.js.org/)

**A minimalist, straight-forward API for using [mobx-state-tree](http://mobx-state-tree.js.org/) with functional React components.**

---

1. [Installation](#installation)

1. [Basic Example](#basic-example)

1. [API Details and Examples](#api-details-and-examples)

   - [useProvider](#useprovider) - Provide your components with a store
   - [createStore](#createstore) - Create a new store inside a component
   - [useStore](#usestore) - Use a store in a component

1. [Testing](#testing)

## Installation

```bash
# via NPM
npm install mobx-store-provider --save
```

```bash
# via Yarn
yarn add mobx-store-provider
```

## Basic Example

```javascript
// App.jsx (Main App component, we use it to create and provide the store)
import React from "react";
import { useProvider, createStore } from "mobx-store-provider";
import AppStore from "./AppStore";
import MyNameDisplay from "./MyNameDisplay";

function App() {
  // Get the Provider for our AppStore
  const Provider = useProvider();

  // Create our AppStore instance
  const appStore = createStore(() => AppStore.create({ user: "Jonathan" }));

  // Wrap our application with the Provider passing it the appStore
  return (
    <Provider value={appStore}>
      <UserDisplay />
    </Provider>
  );
}

export default App;
```

```javascript
// UserDisplay.jsx (A component, we use the store from above inside it)
import React from "react";
import { observer } from "mobx-react";
import { useStore } from "mobx-store-provider";

function UserDisplay() {
  // Get access to the store
  const appStore = useStore();
  return <div>{appStore.user}</div>;
}

export default observer(UserDisplay);
```

```javascript
// AppStore.js (mobx-state-tree store/model)
import { types } from "mobx-state-tree";

const AppStore = types.model({
  user: types.string,
});

export default AppStore;
```

## API Details and Examples

- [useProvider](#useprovider)
- [createStore](#createstore)
- [useStore](#usestore)

### useProvider

```javascript
useProvider(storeIdentifier: any = null): Context.Provider
```

React Hook used to retrieve the React `Context.Provider` for a given `storeIdentifier`. This is a wrapper component you can use to provide your application with the store.

Parameters:

- `storeIdentifier` - _(optional)_ Tells _mobx-store-provider_ which store you want the Provider for.

Example:

```javascript
import { useProvider } from "mobx-store-provider";
import AppStore from "./AppStore";
const appStore = AppStore.create();

function App() {
  const Provider = useProvider();
  return (
    <Provider value={appStore}>
      <MyComponents />
    </Provider>
  );
}

export default App;
```

### createStore

```javascript
createStore(factory: Function, storeIdentifier: any): any
```

React Hook used to instantiate new mobx-state-tree instances inside of components. It returns the store you instantiate and return from the `factory`.

Parameters:

- `factory` - Function where you instantiate and return a mobx-state-tree instance.
- `storeIdentifier` - _(optional)_ Tells _mobx-store-provider_ which store you a creating.

Example:

```javascript
import { createStore, useProvider } from "mobx-store-provider";
import AppStore from "./AppStore";

function App() {
  const Provider = useProvider();
  const appStore = createStore(() => AppStore.create());
  return <Provider value={appStore}>...</Provider>;
}

export default App;
```

### useStore

```javascript
useStore(mapStateToProps: Function = identity, storeIdentifier: any = null): any
```

React Hook used to retrieve a `store` for a given `storeIdentifier`.

Parameters:

- `mapStateToProps` - _(optional)_ Function which you can use to select and return specific slices of the store.
- `storeIdentifier` - _(optional)_ Tells _mobx-store-provider_ which store you want to get access to.

Example:

```javascript
// App.jsx (Main App component, we use it to create and provide the store)
import { useProvider, createStore } from "mobx-store-provider";
import Header from "./Header";
import AppStore from "./AppStore";

// Export our appStore identifier so other components can use it
export const appStoreId = "app-store";

function App() {
  const Provider = useProvider(appStoreId);
  return (
    <Provider value={createStore(appStoreId, () => AppStore.create())}>
      <Header />
    </Provider>
  );
}

export default App;
```

```javascript
// Header.jsx (A component, we use the store inside)
import { observer } from "mobx-react";
import { useStore } from "mobx-store-provider";

// We import the store identifier from above
import { appStoreId } from "./App";

// A selector we use to grab the user from the store
function selectUser(store) {
  return store.user;
}

function Header() {
  // We use the appStore in this component
  const user = useStore(appStoreId, selectUser);
  return <div>User: {user}</div>;
}

export default observer(Header);
```

## Testing

Testing a React app that uses _mobx-state-tree_ and _mobx-store-provider_ is easy.

Here are a few examples using [Jest](https://jestjs.io/) and [react-testing-library](https://github.com/testing-library/react-testing-library):

```javascript
// UserForm.tests.jsx
import { getByTestId, fireEvent } from "@testing-library/dom";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import React from "react";
import { useProvider, createStore } from "mobx-store-provider";

import AppStore from "./AppStore";
import UserForm from "./UserForm";

function getTestContainer(children, mockStore) {
  const Provider = useProvider();
  return render(<Provider value={mockStore}>{children}</Provider>).container;
}

describe("UserForm tests", () => {
  test("The form loads correctly", () => {
    const mockState = { name: "Superman" };
    const mockStore = AppStore.create(mockState);
    const container = getTestContainer(<UserForm />, mockStore);
    expect(queryByTestId(container, "input")).toBeInTheDocument();
    expect(queryByTestId(container, "button")).toBeInTheDocument();
    expect(getByTestId(container, "button")).toHaveValue(mockState.name);
  });

  test("When the name changes the store gets updated", () => {
    const mockState = { name: "Superman" };
    const mockStore = AppStore.create(mockState);
    const container = getTestContainer(<UserForm />, mockStore);
    const input = getByTestId(container, "input");
    expect(input).toHaveValue(mockState.name);
    const testName = "Spiderman";
    fireEvent.change(input, {
      target: { value: testName },
    });
    expect(mockStore.name).toBe(testName);
  });

  test("When I click the button, the form submit action is triggered", () => {
    const mockState = { name: "Superman" };
    const mockStore = AppStore.create(mockState);
    const submit = jest.fn();
    Object.defineProperty(mockStore, "submit", {
      value: submit,
    });
    const container = getTestContainer(<UserForm />, mockStore);
    fireEvent.click(queryByTestId(container, "button"));
    expect(submit).toBeCalled();
  });
});
```

```javascript
// UserForm.jsx (The component we want to test)
import React from "react";
import { observer } from "mobx-react";
import { useStore } from "mobx-store-provider";

function UserForm() {
  const store = useStore();
  return (
    <form onSubmit={store.submit}>
      <input
        type="text"
        data-testid="input"
        value={store.name}
        onChange={store.changeName}
      />
      <button type="submit" data-testid="button">
        Submit
      </button>
    </form>
  );
}

export default observer(UserForm);
```

```javascript
// AppStore.js (Our main/root mobx-state-tree store/model)
import { types } from "mobx-state-tree";

const AppStore = types
  .model({
    name: types.optional(types.string, "Batman"),
  })
  .actions(self => ({
    changeName(event) {
      self.name = event.target.value;
    },
    submit() {
      console.info(`Submitted: ${self.name}`);
    },
  }));

export default AppStore;
```
