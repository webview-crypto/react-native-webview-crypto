require("babel-polyfill");
import * as test from "tape";
import {parse, stringify} from "../src/serializeBinary";
import {cloneDeep} from "lodash";

test("Serializing ArrayBufferView Works", async function (t) {
  const arr = new Int8Array([21, 31]);
  t.equal(
    await stringify(arr),
    '{"__serialize_id":"ArrayBufferView","value":{"name":"Int8Array","buffer":{"__serialize_id":"ArrayBuffer","value":"\\u0015\\u001f"}}}'
  );
  t.end();
});


test("Parsing ArrayBufferView Works", async function (t) {
  const typedArray = await parse('{"__serialize_id":"ArrayBufferView","value":{"name":"Int8Array","buffer":{"__serialize_id":"ArrayBuffer","value":"\\u0015\\u001f"}}}');
  t.deepEqual(
    typedArray,
    [21, 31]
  );
  t.end();
});

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

  // because stringify is destructive
  const cloned = cloneDeep(initialObject);

  t.deepEqual(
    cloned,
    await parse(await stringify(initialObject))
  );
  t.end();
});
