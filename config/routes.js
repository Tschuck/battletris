exports['default'] = {
  routes: (api) => {
    return {
      all: [
        { path: '/rooms', action: 'rooms',  }
      ]
    }
  }
}
