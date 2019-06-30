exports['default'] = {
  routes: (api) => {
    return {
      all: [
        { path: '/battles', action: 'battles', matchTrailingPathParts: true },
        { path: '/rooms', action: 'rooms', matchTrailingPathParts: true },
      ]
    }
  }
}
