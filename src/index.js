import ExtendableError from 'es6-error';

class ApolloError extends ExtendableError {
  constructor (name, {
    message,
    time_thrown = (new Date()).toISOString(),
    data = {},
    options = {},
  }) {
    const t = (arguments[2] && arguments[2].time_thrown) || time_thrown;
    const d = Object.assign({}, data, ((arguments[2] && arguments[2].data) || {}));
    const m = (arguments[2] && arguments[2].message) || message;
    const opts = Object.assign({}, options, ((arguments[2] && arguments[2].options) || {}));

    super(m);

    this.name = name;
    this.message = m;
    this.time_thrown = t;
    this.data = d;
    this._showLocations = !!opts.showLocations;
  }
  serialize () {
    const { name, message, time_thrown, data, _showLocations, path, locations } = this;

    let error = {
      message,
      name,
      time_thrown,
      data,
    };

    if (_showLocations) {
      error.locations = locations;
      error.path = path;
    }

    return error;
  }
}

export const isInstance = e => e instanceof ApolloError;

export const createError = (name, data = { message: 'An error has occurred', options }) => {
  const e = ApolloError.bind(null, name, data);
  return e;
};

export const formatError = (error, returnNull = false) => {
  const originalError = error ? error.originalError || error : null;

  if (!originalError) return returnNull ? null : error;

  const { name } = originalError;

  if (!name || !isInstance(originalError)) return returnNull ? null : error;

  const { time_thrown, message, data, _showLocations } = originalError;

  if (_showLocations) {
    const { locations, path } = error;
    originalError.locations = locations;
    originalError.path = path;
  }

  return originalError.serialize();
};
