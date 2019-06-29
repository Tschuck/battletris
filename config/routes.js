exports['default'] = {
  routes: (api) => {
    return {
      all: [
        { path: '/users', action: 'users', matchTrailingPathParts: true }
      ]
    }
  }
}
