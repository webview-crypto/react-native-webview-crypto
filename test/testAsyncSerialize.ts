import * as test from "tape";
import {Serializer, toObjects, fromObjects} from "../src/asyncSerialize";

interface Thing {
  id: "thing";
  name: number;
  subThing?: Thing;
}

interface SerializedThing {
  name: string;
  subThing?: Thing;
}

const serializer: Serializer<Thing,  SerializedThing> = {
  id: "Thing",
  isType: (o: any) => o.id === "thing",
  toObject: async (t: Thing) => {
    return {
      name: t.name.toString(),
      subThing: t.subThing
    } as SerializedThing;
  },

  fromObject: async (st: SerializedThing) => {
    return {
      id: "thing",
      name: parseInt(st.name),
      subThing: st.subThing
    } as Thing;
  }
};

async function both(o: any) {
  const oUpdated = await toObjects([serializer], o);
  const oAgain = await fromObjects([serializer], oUpdated);
  return oAgain;
}

test("can get back Thing", async function (t) {
  const thing = {
    id: "thing",
    name: 232,
    subThing: undefined
  } as Thing;

  t.deepEqual(
    await both(thing),
    thing
  );
  t.end();
});


test("can get back Thing in Thing", async function (t) {
  const thing = {
    id: "thing",
    name: 232,
    subThing: {
      id: "thing",
      name: 23234,
      subThing: undefined
    }
  } as Thing;

  t.deepEqual(
    await both(thing),
    thing
  );
  t.end();
});


test("can get back Thing in list", async function (t) {
  const objects = [
    {
      id: "thing",
      name: 232,
      subThing: {
        id: "thing",
        name: 23234,
        subThing: undefined
      }
    },
    1,
    "dfd",
    {
      magic: {
        id: "thing",
        name: 232,
        subThing: {
          id: "thing",
          name: 23234,
          subThing: undefined
        }
      }
    }
  ];

  t.deepEqual(
    await both(objects),
    objects
  );
  t.end();
});
