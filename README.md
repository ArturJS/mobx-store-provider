# mobx-store-provider

Conveniently use React Hooks or Consumers to connect a [mobx-state-tree](https://mobx-state-tree.js.org) store to your components.

## Intro

Using mobx-state-tree with newer React requires a bit of glue logic, this library provides that.

It provides a method for supplying your React components with a mobx-state-tree store, so they can bind to and trigger actions on it.

## What problem does mobx-store-provider solve?

When using mobx-state-tree in an application, you have to somehow provide the store to your component.

With class-based components, you would use `inject` and/or `observer` to supply your components with their mobx-state-tree/store and to bind the render function to changes detected.

Here is a class-based example using `@inject` and `@observer` decorators:

```javascript
import React, { Component } from "react";
import { inject, observer, Provider } from "mobx-react";
import { types } from "mobx-state-tree";

// Our mobx-state-tree store definition
const MyStore = types.model({
  name: types.string,
});

// Main component which creates myStore, wraps our content in the provider and passes it as the store value.
export default class MyComponent extends Component {
  myStore = MyStore.create({ name: "Jonathan" });
  render() {
    return (
      <Provider store={this.myStore}>
        <MyNameDisplay />
      </Provider>
    );
  }
}

// This component is assumed to be in a separate module/file.
// Using inject, we get the store from the provider and use it in the render method.
@inject("store")
@observer
class MyNameDisplay extends Component {
  render() {
    return <div>{this.props.store.name}</div>;
  }
}
```

This works well enough, but has a few possible issues:

1. Requires the use of decorators for `@inject` and `@observer`.

   This may be a problem if you don't have control of or know how to add that capability to your bundler. As an example, if you started with a create-react-app base and haven't ejected - then you can't use decorators.

1. In lieu of decorators, it requires you to wrap your components with `inject()` and `observer()`.

   If you can't (or don't want to) use decorators, you can alternatively wrap your components with `inject()` and/or `observer()`:

   ```javascript
   import React from "react";
   import { inject, observer } from "mobx-react";

   const MyNameDisplay = inject("store")(observer(props => <div>{props.store.name}</div>));
   ```

   That is pretty ugly syntax, quite verbose, and I have to read it a bit to understand it.

   In reality, `inject()` in particular works best with a decorator on a class-based component. It isn't ideal for functional/hook-based components.

1. Using `inject()` is not idiomatic apropos to [React Hooks](https://reactjs.org/docs/hooks-reference.html) use (which may matter if you are transitioning to Hooks).

## Using mobx-store-provider

The same example from above, but using mobx-store-provider with hooks on functional components instead:

```javascript
import React from "react";
import { observer } from "mobx-react";
import { types } from "mobx-state-tree";
import StoreProvider, { createStore } from "mobx-store-provider";

// Create the provider and hook we can use in our application to access this store
const { Provider: MyStoreProvider, useStore: useMyStore } = new StoreProvider();

// To provide this store to other components, we export useMyStore here and then import it elsewhere:
export { useMyStore };

// Our mobx-state-tree store definition
const MyStore = types.model({
  name: types.string,
});

// Now we use the hook createStore to create myStore, and then wrap our application with
// MyStoreProvider, passing in myStore for the value.
export default () => {
  const myStore = createStore(() => MyStore.create({ name: "Jonathan" }));
  return (
    <MyStoreProvider value={myStore}>
      <MyNameDisplay />
    </MyStoreProvider>
  );
};

// Instead of inject(), we import useMyStore from where we created it.
import { useMyStore } from "path/to/module";
const MyNameDisplay = observer(() => {
  const myStore = useMyStore();
  return <div>{myStore.name}</div>;
});
```
