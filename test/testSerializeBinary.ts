require("babel-polyfill");
import * as test from "tape";
import {parse, stringify} from "../src/serializeBinary";

test("Parsing and serailizing work together", async function (t) {
  const plainTextString = "This is very sensitive stuff.";

  const plainTextBytes = new Uint8Array(plainTextString.length);
  for (let i = 0; i < plainTextString.length; i++) {
      plainTextBytes[i] = plainTextString.charCodeAt(i);
  }
  const typedArrays = [
    new Int8Array([21, 31]),
    new Uint8Array([23, 55, 2323, 2323]),
    new Uint16Array([23, 55, 2323, 2323]),
    new Float64Array([23.343, 3434.343]),
    plainTextBytes
  ];
  for (let typedArray of typedArrays) {
    t.deepEqual(
      await parse(await stringify(typedArray)),
      typedArray
    );
  }
  t.end();
});


test("Nested works as well", async function (t) {
  const initialObject = [
    1,
    {
      key: new Int8Array([21, 31]),
      otherthing: new Int8Array([21, 31])
    }
  ];

  t.deepEqual(
    initialObject,
    await parse(await stringify(initialObject))
  );
  t.end();
});
