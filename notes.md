

## First time loading
When we load the data back to the gui, we need to prevent the useEffect from running on the initial mount. This way, when we load data from the database (including any user-modified parameters), they won't be overwritten.

Use `useRef` from React to keep track of whether the component has mounted.


## Downside

- It's not straightforward to implement the plugin system for javascript as it is for python.
-
