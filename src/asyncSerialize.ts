export interface Serializer<T, S> {
  id: string;
  isType: (o: any) => boolean;
  toObject?: (t: T) => Promise<S>;
  fromObject?: (o: S) => Promise<T>;
}


export async function toObjects(serializers: Serializer<any, any>[], o: any): Promise<any> {
  // console.log("toObjects", o);
  if (typeof o !== "object") {
    // console.log("skip toObjects", o);
    return o;
  }

  // cant return from for loop https://github.com/Microsoft/TypeScript/issues/4367
  let updatedO = false;
  for (let ser of serializers) {
    if (ser.isType(o)) {
      // console.log("serialzing", o, ser);
      updatedO = true;
      if (ser.toObject) {
        o = await ser.toObject(o);
      }
      // console.log("recursing serialized", o, value);
      o = {
        __serialize_id: ser.id,
        value: await toObjects(serializers, o)
      };
      break;
    }
  }
  if (updatedO) {
    // console.log("updated toObjects", o);

    return o;
  }

  for (let atr in o) {
    // console.log("recursing loop", o, atr);
    o[atr] = await toObjects(serializers, o[atr]);
  }
  // console.log("done toObjects", o);

  return o;
}

export async function fromObjects(serializers: Serializer<any, any>[], o: any): Promise<any> {
  if (typeof o !== "object") {
    return o;
  }
  for (let atr in o) {
    o[atr] = await fromObjects(serializers, o[atr]);
  }
  const id = o.__serialize_id;
  if (id) {
    for (let ser of serializers) {
      if (ser.id === id) {
        o = o.value;
        if (ser.fromObject) {
          o = ser.fromObject(o);
        }
        break;
      }
    }
  }
  return o;
}
