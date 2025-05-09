/**
 * @jest-environment jsdom
 */


import {describe, expect, jest, test} from '@jest/globals';



describe("basic test", () => {
  test("basic test", () => {
    console.log("ahhhhh");
    expect(2).toBe(2);
  })

  describe("jsdom example", () => {
    const div = document.createElement("div");
    document.body.append(div);
    expect(document.querySelector("div")).toBe(div);
    expect(div).toBeInstanceOf(HTMLDivElement);
  })
});