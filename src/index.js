import ExtendableError from 'es6-error';

const errorMap = new Map();

const DELIMITER = ':';

const serializeName = (arr = []) => arr.reduce((str, val) => `${str.length > 0 ? str + DELIMITER : str}${val}`, '');
const deserializeName = (name = '') => {
  const arr = [];
  const str = name.split(DELIMITER);
  arr.push(str.shift());
  arr.push(str.join(DELIMITER));
  return arr;
};

class ApolloError extends ExtendableError {
  constructor (name, {
    message,
    time_thrown = (new Date()).toISOString(),
    data = {}
  }) {
    const t = (arguments[2] && arguments[2].thrown_at) || time_thrown;
    const d = Object.assign({}, data, ((arguments[2] && arguments[2].data) || {}));

    super(serializeName([
      name,
      t
    ]));

    this._name = name;
    this._humanized_message = message || '';
    this._time_thrown = t;
    this._data = d;
  }
  serialize () {
    const name = this._name;
    const message = this._humanized_message;
    const time_thrown = this._time_thrown;
    const data = this._data;
    return {
      message,
      name,
      time_thrown,
      data
    };
  }
}

export const createError = (name, data = { message: 'An error has occurred' }) => {
  const e = ApolloError.bind(null, name, data);
  errorMap.set(name, e);
  return e;
};

export const formatError = (originalError, returnNull = false) => {
  const [ name, thrown_at ] = deserializeName(originalError.message);
  if (!name) return returnNull ? null : originalError;
  const CustomError = errorMap.get(name);
  if (!CustomError) return returnNull ? null : originalError;
  const error = new CustomError({
    thrown_at
  });
  return error.serialize();
};