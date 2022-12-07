/* public */

const mapToLegacyObject = (src) => {
  return {
    aggregate: _mapToLegacyBaseLevelObject(src.aggregate),
    intermediate: _mapToLegacyIntermediate(src)
  };
};

/* Private */

const _mapToLegacyBaseLevelObject = (src) => {
  return {
    timestamp: new Date(getIntegerDate(src.period)),
    scenariosCreated:
      src.counters["vusers.created"] ||
      src.counters["core.vusers.created.total"] ||
      0,
    scenariosCompleted:
      src.counters["vusers.completed"] ||
      src.counters["core.vusers.completed"] ||
      0,
    scenariosAvoided:
      src.counters["vusers.skipped"] ||
      src.counters["core.vusers.skipped"] ||
      0,
    requestsCompleted:
      src.counters["http.responses"] ||
      src.counters["engine.http.responses"] ||
      src.counters["engine.socketio.emit"] ||
      src.counters["engine.websocket.messages_sent"] ||
      0,
    latency: _mapToLegacyLatency(src),
    rps: {
      mean: src.rates
        ? src.rates["http.request_rate"] ||
        src.rates["engine.http.response_rate"] ||
        src.rates["engine.socketio.emit_rate"] ||
        0
        : 0,
      count:
        src.counters["http.responses"] ||
        src.counters["engine.http.responses"] ||
        src.counters["engine.socketio.emit"] ||
        0
    },
    codes: _mapToLegacyCodes(src),
    errors: _mapToLegacyErrors(src),
    phases: _mapToLegacyPhases(src)
  };
};

const _mapToLegacyLatency = (src_in) => {
  var src = src_in.summaries
  var selector = "";
  if (src["http.response_time"]) {
    selector = "http.response_time";
  }
  else if (src["engine.http.response_time"]) {
    selector = "engine.http.response_time";
  }
  else if (src["engine.http.socketio"]) {
    selector = "engine.http.socketio";
  }
  else {
    return {
      min: 0,
      max: 0,
      median: 0,
      p50: 0,
      p95: 0,
      p99: 0
    };
  }

  return {
    min: src[selector].min || 0,
    max: src[selector].max || 0,
    median: src[selector].median || 0,
    p50: src[selector].median || 0,
    p95: src[selector].p95 || 0,
    p99: src[selector].p99 || 0
  };
};

const _mapToLegacyCodes = (src) => {
  var propNameHttp = "http.codes.";
  var propNameSocket = "engine.socketio.codes.";
  var dest = {};
  for (var prop in src.counters) {
    if (prop.startsWith(propNameHttp)) {
      dest[prop.replace(propNameHttp, "")] = src.counters[prop];
    }
    if (prop.startsWith(propNameSocket)) {
      dest[prop.replace(propNameSocket, "")] = src.counters[prop];
    }
  }
  return dest;
};

const _mapToLegacyErrors = (src) => {
  var propName = "errors.";
  var dest = {};
  for (var prop in src.counters) {
    if (prop.startsWith(propName)) {
      dest[prop.replace(propName, "")] = src.counters[prop];
    }
  }
  return dest;
};

const _mapToLegacyIntermediate = (src) => {
  var dest = [];
  src.intermediate.forEach((inter) => {
    dest.push(_mapToLegacyBaseLevelObject(inter));
  });
  return dest;
};

// @ts-ignore
const _mapToLegacyPhases = (src) => {
  return [];
};

const getIntegerDate = (period: any) => {
  if (typeof period === 'string') {
    return parseInt(period);
  }
  else if (typeof period === 'number') {
    return period;
  }
  else {
    throw new Error('invalid type for property period')
  }
}

export {
  mapToLegacyObject
};