declare var require: any;
const map = require("lodash/map");
const find = require("lodash/find");

export interface Serializer<T, S> {
  id: string;
  isType: (o: any) => boolean;
  toObject?: (t: T) => Promise<S>;
  fromObject?: (o: S) => Promise<T>;
}

class Serialized {
  __serializer_id: string;
  value: any;
}

function isSerialized(object: any): object is Serialized {
    return object.hasOwnProperty("__serializer_id");
}

export async function toObjects(serializers: Serializer<any, any>[], o: any): Promise<any> {
  if (typeof o !== "object") {
    return o;
  }

  const serializer = find(serializers, s => s.isType(o));
  if (serializer) {
    const value = serializer.toObject ? await serializer.toObject(o) : o;
    return {
      __serializer_id: serializer.id,
      value: await toObjects(serializers, value)
    } as Serialized;
  }

  const newO = o instanceof Array ? [] : {};
  for (let atr in o) {
    newO[atr] = await toObjects(serializers, o[atr]);
  }
  return newO;
}

export async function fromObjects(serializers: Serializer<any, any>[], o: any): Promise<any> {
  if (typeof o !== "object") {
    return o;
  }

  if (isSerialized(o)) {
    const value = await fromObjects(serializers, o.value);
    const serializer = find(serializers, ["id", o.__serializer_id]);
    if (serializer.fromObject) {
      return serializer.fromObject(value);
    }
    return value;
  }

  const newO = o instanceof Array ? [] : {};
  for (let atr in o) {
    newO[atr] = await fromObjects(serializers, o[atr]);
  }
  return newO;
}
